'use server';
/**
 * @fileOverview เอเจนต์ AI ที่ช่วยวิเคราะห์และแนะนำระดับการคัดกรองผู้ป่วยเบื้องต้นตามอาการ
 *
 * - getTriageSuggestion - ฟังก์ชันสำหรับประมวลผลการแนะนำระดับการคัดกรองด้วย AI
 * - TriageSuggestionInput - ประเภทข้อมูลนำเข้า
 * - TriageSuggestionOutput - ประเภทข้อมูลผลลัพธ์
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TriageSuggestionInputSchema = z.object({
  patientSymptoms: z
    .string()
    .describe('รายละเอียดอาการเบื้องต้นของผู้ป่วย'),
});
export type TriageSuggestionInput = z.infer<typeof TriageSuggestionInputSchema>;

const TriageSuggestionOutputSchema = z.object({
  triageLevel: z
    .enum(['Critical', 'Urgent', 'Minor', 'Deceased'])
    .describe('ระดับการคัดกรองที่แนะนำ (Critical: วิกฤต, Urgent: เร่งด่วน, Minor: ไม่รุนแรง, Deceased: เสียชีวิต)'),
  justification: z
    .string()
    .describe('คำอธิบายสั้นๆ เกี่ยวกับเหตุผลในการแนะนำระดับการคัดกรองนี้ (เป็นภาษาไทย)'),
});
export type TriageSuggestionOutput = z.infer<
  typeof TriageSuggestionOutputSchema
>;

export async function getTriageSuggestion(
  input: TriageSuggestionInput
): Promise<TriageSuggestionOutput> {
  return triageSuggestionFlow(input);
}

const triageSuggestionPrompt = ai.definePrompt({
  name: 'triageSuggestionPrompt',
  input: {schema: TriageSuggestionInputSchema},
  output: {schema: TriageSuggestionOutputSchema},
  prompt: `คุณคือผู้เชี่ยวชาญด้านการคัดกรองผู้ป่วย (Triage Specialist) วิเคราะห์อาการผู้ป่วยต่อไปนี้ แล้วแนะนำระดับความรุนแรง (Critical, Urgent, Minor หรือ Deceased) พร้อมระบุเหตุผลสั้นๆ เป็นภาษาไทย

อาการผู้ป่วย: {{{patientSymptoms}}}

หมายเหตุ: 
- Critical คือ ผู้ป่วยวิกฤตที่ต้องได้รับการช่วยชีวิตทันที
- Urgent คือ ผู้ป่วยเร่งด่วนที่ต้องได้รับการรักษาโดยเร็ว
- Minor คือ ผู้ป่วยที่มีอาการคงที่และไม่รุนแรง
- Deceased คือ ผู้ป่วยที่เสียชีวิตแล้วหรือไม่สามารถกู้ชีพได้
`,
});

const triageSuggestionFlow = ai.defineFlow(
  {
    name: 'triageSuggestionFlow',
    inputSchema: TriageSuggestionInputSchema,
    outputSchema: TriageSuggestionOutputSchema,
  },
  async input => {
    const {output} = await triageSuggestionPrompt(input);
    return output!;
  }
);

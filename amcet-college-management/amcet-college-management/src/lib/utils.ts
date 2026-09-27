export function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatISOToDateInput(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateGPA(marks: { marks: number }[]): { gpa: number; percentage: number; isPass: boolean } {
  if (!marks || marks.length === 0) {
    return { gpa: 0, percentage: 0, isPass: true };
  }

  const totalObtained = marks.reduce((sum, m) => sum + m.marks, 0);
  const totalMax = marks.length * 100;
  const percentage = Math.round((totalObtained / totalMax) * 100 * 10) / 10;
  
  // Calculate 10 point scale GPA
  const gpa = Math.round((percentage / 10) * 10) / 10;

  // Pass if all individual marks >= 40
  const isPass = marks.every(m => m.marks >= 40);

  return { gpa, percentage, isPass };
}

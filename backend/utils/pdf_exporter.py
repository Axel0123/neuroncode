from fpdf import FPDF
from datetime import datetime

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(30, 144, 255)
        self.cell(0, 10, 'CodePulse – Reporte de Ejecución', ln=True, align='C')
        self.set_draw_color(200, 200, 200)
        self.line(10, 20, 200, 20)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 9)
        self.set_text_color(150)
        self.cell(0, 10, f'Página {self.page_no()}', align='C')

def export_pdf(code, output, suggestions, filename="codepulse_reporte.pdf"):
    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Arial", 'B', 12)
    pdf.set_text_color(0)
    pdf.cell(0, 10, f"Fecha de exportación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.ln(4)

    pdf.set_font("Courier", size=10)
    pdf.set_fill_color(245, 245, 245)
    pdf.set_text_color(33, 37, 41)
    pdf.set_draw_color(200, 200, 200)
    pdf.cell(0, 10, "💻 Código:", ln=True, fill=False)
    pdf.multi_cell(0, 6, code, border=1, fill=True)
    pdf.ln(4)

    pdf.set_font("Arial", 'B', 11)
    pdf.set_text_color(0)
    pdf.cell(0, 10, "✅ Salida:", ln=True)
    pdf.set_font("Courier", size=10)
    pdf.multi_cell(0, 6, output, border=1, fill=False)
    pdf.ln(4)

    if suggestions:
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(0, 10, "💡 Sugerencias aplicadas:", ln=True)
        pdf.set_font("Arial", '', 10)
        for s in suggestions:
            pdf.multi_cell(0, 6, f"- {s}", border=0)
    else:
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 10, "No se aplicaron sugerencias.", ln=True)

    pdf.output(filename)

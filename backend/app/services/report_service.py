import io
import csv
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any

class ReportService:
    @staticmethod
    def generate_csv_report(data: List[Dict[str, Any]], headers: List[str]) -> bytes:
        """Generate a standard CSV file."""
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        for row in data:
            # Filter keys to match headers
            filtered_row = {k: v for k, v in row.items() if k in headers}
            writer.writerow(filtered_row)
        return output.getvalue().encode('utf-8')

    @staticmethod
    def generate_excel_report(data: List[Dict[str, Any]]) -> bytes:
        """Generate an Excel file using pandas."""
        df = pd.DataFrame(data)
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name="EPC Report")
        return output.getvalue()

    @staticmethod
    def generate_pdf_report(title: str, data: List[Dict[str, Any]]) -> bytes:
        """Generate a PDF report. Uses reportlab if installed; falls back to raw text layout in bytes."""
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
            story = []

            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=22,
                leading=26,
                textColor=colors.HexColor('#0f172a'),
                spaceAfter=15
            )
            subtitle_style = ParagraphStyle(
                'DocSub',
                parent=styles['Normal'],
                fontSize=10,
                leading=12,
                textColor=colors.HexColor('#64748b'),
                spaceAfter=25
            )
            body_style = ParagraphStyle(
                'DocBody',
                parent=styles['Normal'],
                fontSize=9,
                leading=11,
                textColor=colors.HexColor('#334155')
            )

            story.append(Paragraph(title, title_style))
            story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - DataCentre AI EPC Intelligence Platform", subtitle_style))
            story.append(Spacer(1, 10))

            if data:
                # Prepare table headers and rows
                headers = list(data[0].keys())
                table_data = [headers]
                for row in data:
                    table_data.append([str(row.get(h, '')) for h in headers])

                # Layout table with smart wrapping
                formatted_table_data = []
                for r_idx, row in enumerate(table_data):
                    formatted_row = []
                    for c_idx, cell in enumerate(row):
                        # Wrap in Paragraph for auto-wrap support
                        formatted_row.append(Paragraph(cell, body_style))
                    formatted_table_data.append(formatted_row)

                t = Table(formatted_table_data, colWidths=[(540/len(headers))] * len(headers))
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e293b')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,0), 8),
                    ('TOPPADDING', (0,0), (-1,0), 8),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')])
                ]))
                story.append(t)
            else:
                story.append(Paragraph("No records found.", body_style))

            doc.build(story)
            return buffer.getvalue()
        except ImportError:
            # Fallback simple text PDF or structured text bytes if reportlab is missing
            output = io.BytesIO()
            output.write(f"%PDF-1.4\n1 0 obj\n<< /Title ({title}) /Creator (DataCentre AI) >>\nendobj\n".encode())
            output.write(f"2 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n3 0 obj\n<< /Type /Pages /Kids [4 0 R] /Count 1 >>\nendobj\n".encode())
            output.write(f"4 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << >> >>\nendobj\n".encode())
            
            # Simple text layout in PDF streams
            content = f"BT\n/F1 12 Tf\n50 700 Td\n({title}) Tj\n0 -20 Td\n(Generated on: {datetime.now().strftime('%Y-%m-%d')} - API Export Fallback) Tj\n"
            for row in data[:20]: # Limit fallback to 20 rows
                row_str = " | ".join(f"{k}: {v}" for k, v in row.items())
                # escape parentheses
                row_str = row_str.replace("(", "\\(").replace(")", "\\)")
                content += f"0 -15 Td\n({row_str[:90]}) Tj\n"
            content += "ET"
            
            output.write(f"5 0 obj\n<< /Length {len(content)} >>\nstream\n{content}\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\ntrailer\n<< /Size 6 /Root 2 0 R >>\n%%EOF\n".encode())
            return output.getvalue()

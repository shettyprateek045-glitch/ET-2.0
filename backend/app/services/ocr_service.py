import random

class OCRService:
    @staticmethod
    def extract_text(filename: str, file_content: bytes) -> str:
        """Simulate extracting structured text from documents, drawings, or spreadsheets."""
        filename_lower = filename.lower()
        
        if filename_lower.endswith(('.png', '.jpg', '.jpeg', '.pdf')):
            if 'drawing' in filename_lower or 'dwg' in filename_lower:
                return f"""[OCR Extracted Text - Drawing: {filename}]
SHEET NO: DC-EL-104 (REVISION 3)
TITLE: GENERATOR ROOM 1 POWER LAYOUT AND CABLE TRAY PATHWAY
SCALE: 1/4" = 1'-0"
NOTES:
1. All conduits shall be rigid metal conduit (RMC) unless specified otherwise.
2. Generator belly tank capacity: 10,000 gallons per EPA regulation. Secondary containment required.
3. UPS main feed: 4000A, 480V, 3-phase, 4-wire copper busway.
4. Clearance of 36 inches in front of all switchboards per NEC 110.26.
                """
            elif 'spec' in filename_lower or 'specification' in filename_lower:
                return f"""[OCR Extracted Text - Technical Specification: {filename}]
SECTION 26 32 13 - ENGINE GENERATORS
PART 1 - GENERAL
1.01 SUMMARY
    A. Provide complete standby engine generator sets rated for data centre continuous duty.
1.02 QUALITY ASSURANCE
    A. Comply with EPA Tier 4 emission standards.
    B. Fuel tanks must feature double-wall steel construction providing 110% containment capacity.
    C. Structural support pads must withstand dynamic loads under seismic zone 2B constraints.
                """
            else:
                return f"""[OCR Extracted Text - Document: {filename}]
This document contains the standard operational protocol and RFI history for project Dublin Hyperscale.
Section 1.3: Water cooling supply parameters.
Flow rate: 250 GPM per chiller.
Inlet water temperature: 45°F.
Outlet water temperature: 55°F.
                """
        elif filename_lower.endswith(('.xlsx', '.xls', '.csv')):
            return f"""[Parsed Spreadsheet Metadata - {filename}]
Columns: [Material ID, Description, Quantity, Supplier, Unit Price, Total Cost, Delivery Date, Lead Time Status]
Row Count: 48 entries.
Summary of cost: $1,420,500 total material procurement cost listed.
Highlighted alert: Row 12 (UPS Systems) shows a lead time of 24 weeks, marking a potential milestone bottleneck.
            """
        else:
            return f"""[Parsed Text - {filename}]
Standard contract document details.
Vendor: Apex Switchgear Ltd.
Deliverables: MV Switchgear panels for Substation A.
Total Value: $4,500,000.
Penalty clause: $5,000 per day delayed beyond October 1, 2026.
            """

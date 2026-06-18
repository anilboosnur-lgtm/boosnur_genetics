from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.enums import TA_CENTER
from pathlib import Path
from PIL import Image as PILImage


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "boosnur_genetics_company_profile_whatsapp.pdf"
ASSETS = ROOT / "assets"
TMP_ASSETS = ROOT / "tmp" / "pdfs" / "profile_assets"


GREEN = colors.HexColor("#173B30")
GREEN_DARK = colors.HexColor("#0E2D24")
GOLD = colors.HexColor("#C99743")
CREAM = colors.HexColor("#F4F0E6")
PAPER = colors.HexColor("#FBFAF6")
INK = colors.HexColor("#16261F")
MUTED = colors.HexColor("#5A6861")
LINE = colors.HexColor("#D8D0C2")
PALE_GREEN = colors.HexColor("#DCEBE4")


def register_fonts():
    fonts = [
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
    ]
    if fonts[0].exists():
        pdfmetrics.registerFont(TTFont("ProfileSans", str(fonts[0])))
        pdfmetrics.registerFont(TTFont("ProfileSans-Bold", str(fonts[1])))
        return "ProfileSans", "ProfileSans-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    "Eyebrow",
    fontName=FONT_BOLD,
    fontSize=8,
    leading=10,
    textColor=GOLD,
    uppercase=True,
    spaceAfter=6,
    letterSpacing=1.8,
))
styles.add(ParagraphStyle(
    "ProfileTitle",
    fontName=FONT_BOLD,
    fontSize=30,
    leading=34,
    textColor=colors.white,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    "ProfileTitleDark",
    fontName=FONT_BOLD,
    fontSize=24,
    leading=28,
    textColor=INK,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    "BodyProfile",
    fontName=FONT,
    fontSize=10.5,
    leading=16,
    textColor=MUTED,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    "BodyWhite",
    fontName=FONT,
    fontSize=10.5,
    leading=16,
    textColor=colors.HexColor("#DCE6E1"),
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    "CardTitle",
    fontName=FONT_BOLD,
    fontSize=12,
    leading=15,
    textColor=INK,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    "Small",
    fontName=FONT,
    fontSize=8.5,
    leading=12,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    "Contact",
    fontName=FONT_BOLD,
    fontSize=12,
    leading=16,
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    "CenterSmall",
    parent=styles["Small"],
    alignment=TA_CENTER,
))


def p(text, style="BodyProfile"):
    return Paragraph(text, styles[style])


def img(path, width, height):
    image = Image(str(path), width=width, height=height)
    image.hAlign = "CENTER"
    return image


def optimized_image(name, max_width=1200):
    TMP_ASSETS.mkdir(parents=True, exist_ok=True)
    src = ASSETS / name
    out = TMP_ASSETS / f"{Path(name).stem}.jpg"
    with PILImage.open(src) as im:
        im = im.convert("RGB")
        if im.width > max_width:
            ratio = max_width / im.width
            im = im.resize((max_width, int(im.height * ratio)))
        im.save(out, "JPEG", quality=74, optimize=True)
    return out


def card(title, body, width=72 * mm):
    data = [[p(title, "CardTitle")], [p(body, "Small")]]
    t = Table(data, colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("BOX", (0, 0), (-1, -1), 0.7, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def draw_logo_mark(canvas, x, y, size):
    canvas.saveState()
    canvas.setStrokeColor(colors.white)
    canvas.setLineWidth(1.2)
    canvas.circle(x + size / 2, y + size / 2, size / 2, stroke=1, fill=0)
    canvas.setStrokeColor(colors.HexColor("#DCE6E1"))
    canvas.setLineWidth(0.8)
    canvas.line(x + size * 0.22, y + size * 0.34, x + size * 0.80, y + size * 0.43)
    canvas.setStrokeColor(GOLD)
    canvas.line(x + size * 0.28, y + size * 0.24, x + size * 0.72, y + size * 0.30)
    canvas.setStrokeColor(colors.white)
    canvas.setLineWidth(1)
    canvas.line(x + size * 0.5, y + size * 0.38, x + size * 0.5, y + size * 0.72)
    canvas.setFillColor(GOLD)
    left_leaf = canvas.beginPath()
    left_leaf.moveTo(x + size * 0.49, y + size * 0.57)
    left_leaf.curveTo(x + size * 0.28, y + size * 0.58, x + size * 0.24, y + size * 0.75, x + size * 0.23, y + size * 0.83)
    left_leaf.curveTo(x + size * 0.42, y + size * 0.84, x + size * 0.55, y + size * 0.76, x + size * 0.49, y + size * 0.57)
    canvas.drawPath(left_leaf, stroke=0, fill=1)
    right_leaf = canvas.beginPath()
    right_leaf.moveTo(x + size * 0.51, y + size * 0.48)
    right_leaf.curveTo(x + size * 0.72, y + size * 0.50, x + size * 0.76, y + size * 0.67, x + size * 0.77, y + size * 0.75)
    right_leaf.curveTo(x + size * 0.58, y + size * 0.76, x + size * 0.45, y + size * 0.68, x + size * 0.51, y + size * 0.48)
    canvas.drawPath(right_leaf, stroke=0, fill=1)
    canvas.restoreState()


def draw_watermark_logo(canvas, x, y, size):
    canvas.saveState()
    try:
        canvas.setStrokeAlpha(0.014)
        canvas.setFillAlpha(0.014)
    except Exception:
        pass
    canvas.setStrokeColor(GREEN_DARK)
    canvas.setFillColor(GREEN_DARK)
    canvas.setLineWidth(2)
    canvas.circle(x + size / 2, y + size / 2, size / 2, stroke=1, fill=0)
    canvas.setStrokeColor(GREEN)
    canvas.setLineWidth(2)
    canvas.line(x + size * 0.22, y + size * 0.34, x + size * 0.80, y + size * 0.43)
    canvas.setStrokeColor(GOLD)
    canvas.line(x + size * 0.28, y + size * 0.25, x + size * 0.72, y + size * 0.30)
    canvas.setStrokeColor(GREEN_DARK)
    canvas.line(x + size * 0.5, y + size * 0.38, x + size * 0.5, y + size * 0.72)

    canvas.setFillColor(GOLD)
    left_leaf = canvas.beginPath()
    left_leaf.moveTo(x + size * 0.49, y + size * 0.57)
    left_leaf.curveTo(x + size * 0.28, y + size * 0.58, x + size * 0.24, y + size * 0.75, x + size * 0.23, y + size * 0.83)
    left_leaf.curveTo(x + size * 0.42, y + size * 0.84, x + size * 0.55, y + size * 0.76, x + size * 0.49, y + size * 0.57)
    canvas.drawPath(left_leaf, stroke=0, fill=1)

    canvas.setFillColor(GREEN)
    right_leaf = canvas.beginPath()
    right_leaf.moveTo(x + size * 0.51, y + size * 0.48)
    right_leaf.curveTo(x + size * 0.72, y + size * 0.50, x + size * 0.76, y + size * 0.67, x + size * 0.77, y + size * 0.75)
    right_leaf.curveTo(x + size * 0.58, y + size * 0.76, x + size * 0.45, y + size * 0.68, x + size * 0.51, y + size * 0.48)
    canvas.drawPath(right_leaf, stroke=0, fill=1)

    canvas.setFillColor(GREEN_DARK)
    canvas.setFont(FONT_BOLD, size * 0.082)
    canvas.drawCentredString(x + size / 2, y + size * 0.17, "BOOSNUR")
    canvas.setFont(FONT_BOLD, size * 0.052)
    canvas.drawCentredString(x + size / 2, y + size * 0.115, "GENETICS")
    canvas.restoreState()


def draw_watermark(canvas):
    canvas.saveState()
    size = 88 * mm
    draw_watermark_logo(canvas, (A4[0] - size) / 2, (A4[1] - size) / 2, size)
    canvas.restoreState()


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(GREEN_DARK)
    canvas.rect(0, A4[1] - 13 * mm, A4[0], 13 * mm, stroke=0, fill=1)
    draw_logo_mark(canvas, 16 * mm, A4[1] - 11 * mm, 7.8 * mm)
    canvas.setFillColor(colors.white)
    canvas.setFont(FONT_BOLD, 8.5)
    canvas.drawString(26 * mm, A4[1] - 6.1 * mm, "BOOSNUR")
    canvas.setFont(FONT, 5.8)
    canvas.drawString(26 * mm, A4[1] - 9 * mm, "GENETICS")
    canvas.setFillColor(GOLD)
    canvas.setFont(FONT_BOLD, 8)
    canvas.drawRightString(A4[0] - 16 * mm, A4[1] - 7.3 * mm, "Global Seed Solutions from India")
    canvas.setFillColor(GREEN_DARK)
    canvas.rect(0, 0, A4[0], 9 * mm, stroke=0, fill=1)
    canvas.setFillColor(colors.HexColor("#DCE6E1"))
    canvas.setFont(FONT, 7.5)
    canvas.drawString(16 * mm, 3.2 * mm, "Davangere, Karnataka, India | +91 88927 57959 | info@boosnurgenetics.com")
    canvas.drawRightString(A4[0] - 16 * mm, 3.2 * mm, f"Page {doc.page}")
    canvas.restoreState()


def make_table(rows, col_widths):
    t = Table(rows, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), FONT),
        ("FONTSIZE", (0, 1), (-1, -1), 9.2),
        ("TEXTCOLOR", (0, 1), (-1, -1), INK),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    return t


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    image_paths = {
        "hero": optimized_image("hero-seed-field.png", 1300),
        "tomato": optimized_image("product-tomato.png", 900),
        "chilli": optimized_image("product-chilli.png", 900),
        "bell": optimized_image("product-bell-pepper.png", 900),
        "custom": optimized_image("product-custom.png", 900),
    }
    doc = BaseDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=18 * mm,
        bottomMargin=15 * mm,
        title="Boosnur Genetics Company Profile",
        author="Boosnur Genetics",
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="profile", frames=[frame], onPage=header_footer)])

    story = []

    cover_image = img(image_paths["hero"], 178 * mm, 95 * mm)
    story.append(cover_image)
    story.append(Spacer(1, 9 * mm))
    intro = Table([
        [
            [
                p("GLOBAL SEED SOLUTIONS FROM INDIA", "Eyebrow"),
                p("Contract Seed Production & Export from India", "ProfileTitleDark"),
                p("Boosnur Genetics is a contract seed production and export company based in Davangere, Karnataka, India. We support vegetable seed buyers with requirement-led growing, field monitoring, seed handling, and export documentation coordination.", "BodyProfile"),
            ],
            [
                p("Phone / WhatsApp", "Small"),
                p("+91 88927 57959", "CardTitle"),
                p("Email", "Small"),
                p("info@boosnurgenetics.com", "CardTitle"),
                p("Location", "Small"),
                p("Davangere, Karnataka, India", "CardTitle"),
            ],
        ]
    ], colWidths=[112 * mm, 58 * mm])
    intro.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), PAPER),
        ("BACKGROUND", (1, 0), (1, 0), GREEN),
        ("TEXTCOLOR", (1, 0), (1, 0), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
    ]))
    story.append(intro)
    story.append(PageBreak())

    story.append(p("WHY BUYERS WORK WITH US", "Eyebrow"))
    story.append(p("Trust built early, from field to export.", "ProfileTitleDark"))
    story.append(p("Boosnur Genetics supports buyers looking for practical, requirement-led seed production programs with clear communication, field-level coordination, and dependable export preparation.", "BodyProfile"))
    story.append(Spacer(1, 5 * mm))
    story.append(Table([
        [card("Davangere, Karnataka Base", "Located in an active agricultural region with access to grower networks and field-level coordination."),
         card("Contract Seed Production", "Production begins after understanding crop, variety, quantity, timeline, quality expectations, and destination market.")],
        [card("Export Documentation Support", "Coordination for export preparation, buyer communication, and shipment documentation requirements."),
         card("Field Monitoring", "Crop-stage updates and practical coordination with growers from planning to dispatch.")],
    ], colWidths=[84 * mm, 84 * mm], hAlign="LEFT"))
    story.append(Spacer(1, 8 * mm))

    story.append(p("OUR PRODUCTION APPROACH", "Eyebrow"))
    process_rows = [
        ["Stage", "What We Coordinate"],
        ["1. Requirement Discussion", "Crop, variety, quantity, seed standard, destination, and expected timeline."],
        ["2. Production Planning", "Growing window, isolation needs, acreage, and grower availability."],
        ["3. Farmer Network Selection", "Grower alignment according to program feasibility and buyer expectations."],
        ["4. Crop Monitoring", "Field progress, crop health, and important production stages."],
        ["5. Quality Inspection", "Seed handling, cleaning, grading, packing, and quality expectations."],
        ["6. Export Coordination", "Documentation, shipment communication, and buyer updates through dispatch."],
    ]
    story.append(make_table(process_rows, [52 * mm, 118 * mm]))
    story.append(PageBreak())

    story.append(p("CROPS WE PRODUCE", "Eyebrow"))
    story.append(p("Vegetable seed programs planned to buyer needs.", "ProfileTitleDark"))
    story.append(p("Crop selection, acreage, isolation, and production timeline are discussed before each program begins. Availability is shown honestly as request-based because contract production depends on buyer requirements and seasonal feasibility.", "BodyProfile"))
    story.append(Spacer(1, 5 * mm))
    crops = [
        [img(image_paths["tomato"], 39 * mm, 28 * mm), p("<b>Tomato Seeds</b><br/>Hybrid or OP programs according to requirement.", "Small")],
        [img(image_paths["chilli"], 39 * mm, 28 * mm), p("<b>Chilli / Hot Pepper Seeds</b><br/>Programs planned around buyer-specified pepper requirements.", "Small")],
        [img(image_paths["bell"], 39 * mm, 28 * mm), p("<b>Bell Pepper / Capsicum Seeds</b><br/>Production feasibility reviewed by variety, season, and quantity.", "Small")],
        [img(image_paths["custom"], 39 * mm, 28 * mm), p("<b>Buyer-Specified Crops</b><br/>Custom OP or hybrid vegetable seed programs on request.", "Small")],
    ]
    crop_table = Table(crops, colWidths=[43 * mm, 125 * mm])
    crop_table.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(crop_table)
    story.append(Spacer(1, 7 * mm))
    availability_rows = [
        ["Crop", "Availability", "MOQ"],
        ["Tomato", "On Request", "Discuss by program"],
        ["Chilli / Hot Pepper", "On Request", "Discuss by program"],
        ["Bell Pepper / Capsicum", "On Request", "Discuss by program"],
        ["Buyer-Specified Crops", "Feasibility Review", "Variable"],
    ]
    story.append(make_table(availability_rows, [58 * mm, 55 * mm, 55 * mm]))
    story.append(Spacer(1, 8 * mm))

    story.append(p("DOCUMENTATION & COMPLIANCE", "Eyebrow"))
    compliance = Table([
        [p("IEC / Export Registration", "CardTitle"), p("GST & Commercial Documents", "CardTitle"), p("Phytosanitary Coordination", "CardTitle"), p("Seed Testing Support", "CardTitle")],
        [p("Export-ready business documentation and buyer onboarding support.", "Small"), p("Invoices, packing details, and commercial records for shipment coordination.", "Small"), p("Plant-health documentation support based on destination requirements.", "Small"), p("Testing and quality checks can be coordinated as required by the buyer.", "Small")],
    ], colWidths=[42 * mm, 42 * mm, 42 * mm, 42 * mm])
    compliance.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_GREEN),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.white),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(compliance)
    story.append(PageBreak())

    story.append(p("WORKING PRINCIPLES", "Eyebrow"))
    story.append(p("We believe trust is earned through consistent execution, transparent communication, and dependable delivery.", "ProfileTitleDark"))
    principles = [
        "Transparent communication",
        "Field-level monitoring",
        "Buyer-first planning",
        "Practical production commitments",
        "Long-term partnerships",
    ]
    story.append(Table([[p(item, "CenterSmall") for item in principles]], colWidths=[34 * mm] * 5, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CREAM),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ])))
    story.append(Spacer(1, 8 * mm))
    story.append(p("MARKETS WE AIM TO SERVE", "Eyebrow"))
    story.append(p("Boosnur Genetics is building export-oriented seed production programs for buyers across international markets where Indian agricultural quality can create long-term value.", "BodyProfile"))
    markets = [["Africa", "Southeast Asia", "Middle East", "South Asia", "Buyer-specified markets"]]
    story.append(Table(markets, colWidths=[34 * mm] * 5, style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("FONTNAME", (0, 0), (-1, -1), FONT_BOLD),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TEXTCOLOR", (0, 0), (-1, -1), GREEN),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ])))
    story.append(Spacer(1, 10 * mm))

    cta = Table([
        [
            [
                p("START A CONVERSATION", "Eyebrow"),
                p("Share your seed requirement with us.", "ProfileTitle"),
                p("Whether you are a grower, distributor, exporter, or seed company, submit your crop, quantity, quality expectations, timeline, and destination. Our team will respond with tailored support.", "BodyWhite"),
            ],
            [
                p("Phone / WhatsApp", "Small"),
                p("+91 88927 57959", "Contact"),
                p("Email", "Small"),
                p("info@boosnurgenetics.com", "Contact"),
                p("Location", "Small"),
                p("Davangere, Karnataka, India", "Contact"),
            ],
        ]
    ], colWidths=[106 * mm, 62 * mm])
    cta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), GREEN),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 16),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 16),
        ("LEFTPADDING", (0, 0), (-1, -1), 16),
        ("RIGHTPADDING", (0, 0), (-1, -1), 16),
    ]))
    story.append(cta)

    doc.build(story)
    return OUT


if __name__ == "__main__":
    print(build())

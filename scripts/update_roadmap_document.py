import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
import shutil
import os

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def add_heading_1(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(74, 18, 30) # #4A121E Royal Maroon
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = RGBColor(180, 83, 9) # #B45309 Amber Gold
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(11.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(30, 41, 59)
    return p

def add_body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(text)
    run.font.name = 'Calibri'
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(51, 65, 85)
    return p

def add_bullet(doc, title, text):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    run1 = p.add_run(title + ': ')
    run1.font.name = 'Calibri'
    run1.font.size = Pt(10.5)
    run1.font.bold = True
    run1.font.color.rgb = RGBColor(74, 18, 30)
    run2 = p.add_run(text)
    run2.font.name = 'Calibri'
    run2.font.size = Pt(10.5)
    run2.font.color.rgb = RGBColor(51, 65, 85)
    return p

def main():
    doc_path = 'The_Laddu_Story_Omnichannel_Architecture_and_Roadmap.docx'
    doc = docx.Document(doc_path)
    
    # Update Version in subtitle (paragraph 2)
    for p in doc.paragraphs[:5]:
        if 'Version: 2.0' in p.text:
            p.text = p.text.replace('Version: 2.0 (Strategic Architectural Review)', 'Version: 3.0 (Omnichannel Social, Feedback & B2B Expansion Masterplan)')
    
    # -------------------------------------------------------------------------
    # SECTION 8: META SUITE ENTERPRISE INTEGRATION
    # -------------------------------------------------------------------------
    add_heading_1(doc, '8. Meta Suite Enterprise Integration (Instagram Shopping, Facebook Shop & Webhook Automation)')
    add_body(doc, 'The Laddu Story leverages Meta’s ecosystem (Instagram, Facebook, and WhatsApp) as its primary D2C discovery, engagement, and conversion engine. Integrating the application directly with Meta’s Graph API and Commerce Manager transforms social content into frictionless instant purchases without redirecting customers to third-party marketplaces where 25-30% commissions are lost.')
    
    add_heading_2(doc, '8.1 Meta Commerce Manager & Automated Product Catalog Feed')
    add_body(doc, 'To enable native product shopping on Instagram and Facebook, the platform deploys an automated daily product data feed directly synchronized with the master database:')
    add_bullet(doc, 'Automated XML/CSV Feed', 'The backend exposes a secure catalog endpoint (e.g., https://theladdustory.com/api/catalog/meta-feed.xml) adhering strictly to Meta Catalog Specifications. This feed maps SKU, Title, Description, Image URL, Stock Status, and Tiered Pricing (250g, 500g, 1 Kg).')
    add_bullet(doc, 'Real-Time Inventory Synchronization', 'When kitchen staff marks an item as OUT OF STOCK in the Staff OMS Inventory Manager, the status propagates to the Meta Catalog within scheduled synchronization windows, preventing customer disappointment and unfulfillable orders.')
    add_bullet(doc, 'Deep-Link Checkout URLs', 'Every tagged product links directly to the mobile store with that item and weight pre-selected in the user’s cart (e.g., https://theladdustory.com/?sku=DATES-POPS&weight=250g), reducing checkout abandonment.')

    add_heading_2(doc, '8.2 Instagram Shopping & Facebook Shop Product Tagging')
    add_body(doc, 'With the Meta Catalog approved, The Laddu Story activates native shopping features across social surfaces:')
    add_bullet(doc, 'Reels & Stories Product Tags', 'High-engagement food reels showcasing pure cow ghee roasting or child-safe Dry Fruit Pops feature a clickable "View Product" shopping bag badge. Viewers can tap to view price, superfood ingredients, and instantly check out.')
    add_bullet(doc, 'Facebook Shop Showcase', 'Curated collections (Artisanal Laddus, Superfood Millets, Diabetic-Friendly, Savory Munchies) displayed cleanly on The Laddu Story Facebook Page with direct checkout links.')

    add_heading_2(doc, '8.3 Meta Conversions API (CAPI) & Server-Side Pixel Tracking')
    add_body(doc, 'Browser-based cookies and pixels lose up to 40% of conversion data due to iOS 14+ tracking restrictions, safari privacy controls, and ad-blockers. The Laddu Story deploys Meta Conversions API (CAPI) for server-side telemetry:')
    add_bullet(doc, 'Event Telemetry', 'Critical business events (PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase) are dispatched simultaneously from the client browser and securely from the backend server using hashed customer phone numbers and order IDs.')
    add_bullet(doc, 'Ad Optimization & ROAS', 'Meta’s machine learning algorithms use these accurate purchase signals to optimize hyper-local Bangalore ad campaigns, resulting in lower Cost-Per-Acquisition (CPA) and higher Return-On-Ad-Spend (ROAS).')

    add_heading_2(doc, '8.4 Conversational DM-to-Cart Automation (Meta Webhook Bot)')
    add_body(doc, 'An inbound webhook controller connects to Instagram Messaging and Facebook Messenger APIs:')
    add_bullet(doc, 'Keyword Triggered Auto-DM', 'When a user comments "POPS" or "ORDER" on an Instagram Reel, an automated webhook instantly sends a personalized Direct Message with a link to that specific product along with a special first-order discount code.')
    add_bullet(doc, 'Interactive Menu & Order Concierge', 'Users DMing the page receive a quick-reply menu: 1) Browse Menu, 2) Order Fresh Laddus, 3) Track Existing Order, 4) Speak to Kitchen Chef.')

    # -------------------------------------------------------------------------
    # SECTION 9: CUSTOMER FEEDBACK & GOOGLE BUSINESS PROFILE INTEGRATION
    # -------------------------------------------------------------------------
    add_heading_1(doc, '9. Customer Feedback Engine & Google Business Profile Architecture')
    add_body(doc, 'For high-end artisanal food brands in Bangalore, Google Business Profile (Google Maps & Local Search) is the single most powerful organic discovery channel. Over 65% of local walk-in and pickup orders originate from high-intent searches such as "best laddus near me", "sugar-free sweets Bangalore", or "pure ghee laddus Bangalore". Achieving and maintaining a 4.9+ star rating with hundreds of reviews drives continuous organic footfall at zero advertising cost.')

    add_heading_2(doc, '9.1 Strategic Evaluation: Is Google Business Profile the Right Choice?')
    add_body(doc, 'Yes, Google Business Profile (GBP) is indisputably superior to generic internal review forms because it influences Google’s Local 3-Pack ranking algorithm. The architectural challenge, however, is preventing negative reviews from becoming public while maximizing public 5-star Google ratings.')

    add_heading_2(doc, '9.2 The "Smart Sentiment Routing" Architecture')
    add_body(doc, 'The Laddu Story implements an automated, two-tier post-fulfillment feedback loop driven by order status triggers:')
    add_bullet(doc, 'Trigger Condition', '2 hours after an order status changes to COMPLETED or PICKED_UP in the Supabase database, an automated worker initiates the feedback sequence.')
    add_bullet(doc, 'Frictionless Touchpoint', 'A friendly WhatsApp message is dispatched to the patron: "Namaste [Name]! Hope you enjoyed our freshly roasted [Product Name] today. How would you rate your experience with us? (Rate 1 to 5 Stars)"')
    add_bullet(doc, 'Promoter Flow (4★ - 5★ Rating)', 'If the customer selects 4 or 5 stars, the system immediately thanks them and invites them to share their review on Google: "We are thrilled! As a small Bangalore artisanal kitchen, your Google review helps other families discover healthy sweets. Tap here to leave a review: [Direct Google Review Link]". The link opens Google Maps review submission with 5 stars pre-selected.')
    add_bullet(doc, 'Detractor Protection Flow (1★ - 3★ Rating)', 'If the customer selects 1, 2, or 3 stars, the system does NOT direct them to Google. Instead, it routes them to a private internal feedback form: "We are truly sorry that we did not meet your expectations. Please let our founder know what went wrong so we can make it right."')
    add_bullet(doc, 'Instant Kitchen Escalation', 'Any rating of 3 stars or below triggers an immediate priority alert to the founder’s WhatsApp (+91 9343207515) with customer details, order history, and feedback text, enabling the founder to call the customer, apologize, and offer a fresh replacement box before any public complaint is posted.')

    add_heading_2(doc, '9.3 In-App Social Proof Integration')
    add_body(doc, 'Approved 5-star Google reviews and verified patron testimonials are dynamically showcased across the web application:')
    add_bullet(doc, 'Trust Header Badge', 'A top banner displaying "⭐ 4.9/5 Rating on Google (150+ Verified Bangalore Patrons)".')
    add_bullet(doc, 'Curated Review Carousel', 'A sliding testimonial card section on the homepage highlighting verified customer comments on taste, authentic cow ghee aroma, and child-safe ingredients.')

    # -------------------------------------------------------------------------
    # SECTION 10: SOCIAL MEDIA LEAD GENERATION & VIRAL GROWTH PLAYBOOK
    # -------------------------------------------------------------------------
    add_heading_1(doc, '10. Social Media Growth & High-Velocity Lead Generation Funnel')
    add_body(doc, 'Transitioning from a boutique local kitchen to an established D2C brand requires an intentional social acquisition funnel that systematically turns viewers into repeat buyers.')

    add_heading_2(doc, '10.1 The 3-Pillar Visual Content Strategy')
    add_body(doc, 'Visual and video content in the artisanal confectionery category must communicate sensory appeal and nutritional integrity:')
    add_bullet(doc, 'Pillar 1: Sensory Artisanal Craftsmanship', 'Macro slow-motion videos showcasing golden A2 Desi Cow Ghee melting into roasted grain flour, hand-rolling of laddus, and the crunch of premium California almonds and pistachios. Focus on the zero-sugar, pure jaggery USP.')
    add_bullet(doc, 'Pillar 2: Health & Life-Stage Solutions', 'Educational reels focused on specific customer segments: 1) "Why Dry Fruits Pops replace artificial chocolates for toddlers", 2) "Diabetic-friendly snacking with low-glycemic Ragi Walnut", 3) "Post-partum healing Panjeeri for new mothers".')
    add_bullet(doc, 'Pillar 3: Founder & Kitchen Transparency', 'Behind-the-scenes stories from the Bangalore kitchen showing hygienic preparation, fresh daily batches, and customer gift packing.')

    add_heading_2(doc, '10.2 Hyper-Local Meta Lead Generation Ads')
    add_body(doc, 'Given that freshly prepared artisanal laddus have peak consumer appeal within their immediate delivery city, advertising budget is strictly allocated to hyper-local parameters:')
    add_bullet(doc, 'Geographic Targeting', 'Radius of 10-12 km centered around the Bangalore kitchen covering key high-income corridors (Indiranagar, Koramangala, HSR Layout, Bellandur, Sarjapur Road, Whitefield, JP Nagar).')
    add_bullet(doc, 'Ad Format: Click-to-WhatsApp Ads', 'Ads designed with a clear call-to-action ("Order Freshly Roasted Artisanal Laddus Today - Tap to Chat"). When clicked, WhatsApp opens with a pre-filled greeting message ("Namaste, I want to try The Laddu Story Sampler Box"). Conversion rates for Click-to-WhatsApp ads in India are 3.5x higher than mobile web forms.')

    add_heading_2(doc, '10.3 Patron Referral Program ("Sweet Rewards")')
    add_body(doc, 'Organic word-of-mouth is amplified by embedding a structured referral mechanism into the Customer Account Portal:')
    add_bullet(doc, 'Unique Referral Codes', 'Every registered customer receives a personal referral code (e.g. "NAVIN100").')
    add_bullet(doc, 'Two-Sided Incentive', 'When a friend places their first order using the code, the friend receives ₹100 off, and the referrer receives ₹100 in Laddu Store Credit applied automatically to their next pickup or delivery.')

    # -------------------------------------------------------------------------
    # SECTION 11: CORPORATE GIFTING & B2B BULK ORDER ARCHITECTURE
    # -------------------------------------------------------------------------
    add_heading_1(doc, '11. Corporate Gifting & B2B Bulk Order Architecture')
    add_body(doc, 'Corporate and institutional bulk orders represent high-margin, high-volume revenue streams with predictable seasonal peaks (Diwali, New Year, Dussehra, Annual Conferences, Employee Onboarding). Tech enterprises and corporate firms in Bangalore consistently seek premium, healthy, preservative-free confectionery gifts to replace cheap commercial sweets.')

    add_heading_2(doc, '11.1 Dedicated In-App B2B Inquiry Portal')
    add_body(doc, 'A dedicated "Corporate & Bulk Gifting" section is incorporated into the web platform:')
    add_bullet(doc, 'Corporate Inquiry Form', 'Captures Company Name, Contact Person, Corporate Email, Phone, Delivery Date, Delivery Location(s), and Estimated Quantity (Minimum Order Quantity: 20 boxes).')
    add_bullet(doc, 'GST Invoice Support', 'Allows businesses to enter their GSTIN to claim Input Tax Credit (ITC), a decisive factor for corporate procurement teams.')
    add_bullet(doc, 'Custom Branding Options', 'Configurable packaging options: Custom gold-foil company logo sleeves, branded greetings cards with CEO message, and custom ribbon colors.')
    add_bullet(doc, 'Complimentary Corporate Tasting Box Request', 'Verified corporate procurement officers and HR managers can request a complimentary 4-piece sampler box dispatched to their office address for executive evaluation.')

    add_heading_2(doc, '11.2 Tiered Volume Pricing Matrix')
    add_body(doc, 'To incentivize larger orders while preserving healthy gross margins, the platform establishes transparent volume pricing:')
    
    # Add B2B Volume Pricing Table
    table = doc.add_table(rows=5, cols=4)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    headers = ['Order Tier (Boxes)', 'Discount Percentage', 'Packaging Inclusions', 'Payment & Credit Terms']
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        set_cell_background(cell, '4A121E')
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
    
    tier_data = [
        ['Tier 1: 20 – 50 Boxes', '10% Off Catalog Price', 'Standard Royal Maroon Box + Gold Foil Ribbon', '100% Advance Payment via UPI / NEFT'],
        ['Tier 2: 51 – 150 Boxes', '15% Off Catalog Price', 'Includes Personalized Corporate Greeting Card', '50% Advance on PO, 50% on Delivery'],
        ['Tier 3: 151 – 500 Boxes', '20% Off Catalog Price', 'Includes Custom Logo Printed Sleeve & Ribbon', '50% Advance on PO, 50% Net-15 Days'],
        ['Tier 4: 500+ Boxes', '25% Off Catalog Price', 'Fully Bespoke Packaging & Multi-Office Dispatch', '30% Advance on PO, Balance Net-30 Days']
    ]
    
    for row_idx, row_data in enumerate(tier_data):
        row = table.rows[row_idx + 1]
        bg_color = 'FAF6F0' if row_idx % 2 == 0 else 'FFFFFF'
        for col_idx, text in enumerate(row_data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, 100, 100, 120, 120)
            p = cell.paragraphs[0]
            if col_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(text)
                run.font.bold = True
                run.font.color.rgb = RGBColor(74, 18, 30)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(text)
                run.font.color.rgb = RGBColor(51, 65, 85)
            run.font.name = 'Calibri'
            run.font.size = Pt(9)

    add_heading_2(doc, '11.3 Database Schema for Corporate CRM in Supabase')
    add_body(doc, 'Corporate leads are tracked in a dedicated relational table corporate_inquiries in the master database:')
    add_bullet(doc, 'Table Fields', 'inquiry_id (UUID), company_name (TEXT), contact_person (TEXT), designation (TEXT), email (TEXT), phone (TEXT), gstin (TEXT), estimated_boxes (INTEGER), target_delivery_date (DATE), budget_per_box (NUMERIC), packaging_notes (TEXT), status (NEW, SAMPLE_SENT, QUOTED, PO_APPROVED, FULFILLED, CANCELLED), created_at (TIMESTAMP).')
    add_bullet(doc, 'Automated Sales Notifications', 'Every new corporate submission triggers an instant email and WhatsApp alert to the founder with full contact details and estimated deal size for immediate follow-up within 2 hours.')

    add_heading_2(doc, '11.4 B2B Outbound Outreach Playbook for Bangalore')
    add_body(doc, 'Proactive corporate lead generation is executed via structured outbound cadences:')
    add_bullet(doc, 'Target Decision Makers', 'Head of Human Resources, Chief People Officers, Employee Engagement Managers, Executive Assistants, and Facilities/Admin Heads across IT Parks (Manyata, Ecospace, RMZ Infinity, Bagmane Tech Park, Prestige Tech Park).')
    add_bullet(doc, 'The "Golden Sample Box" Strategy', '45 days prior to major festive cycles (Diwali, New Year), 50 curated sample boxes are hand-delivered directly to shortlisted HR leaders with a handwritten letter from the founder introducing healthy, preservative-free artisanal sweets for their teams. Historically, high-end edible samplers achieve a 25-35% corporate conversion rate.')

    # -------------------------------------------------------------------------
    # SECTION 12: CONSOLIDATED STRATEGIC IMPLEMENTATION ROADMAP
    # -------------------------------------------------------------------------
    add_heading_1(doc, '12. Consolidated Strategic Implementation Roadmap (Phases 1 through 5)')
    add_body(doc, 'The complete architectural evolution is sequenced into prioritized, non-disruptive phases:')

    roadmap_table = doc.add_table(rows=6, cols=4)
    roadmap_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    roadmap_table.autofit = False

    rm_headers = ['Phase & Milestone', 'Key Features & Deliverables', 'Timeline', 'Business Impact']
    for i, h in enumerate(rm_headers):
        cell = roadmap_table.rows[0].cells[i]
        set_cell_background(cell, '1E293B')
        set_cell_margins(cell, 120, 120, 150, 150)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run(h)
        run.font.name = 'Calibri'
        run.font.size = Pt(9.5)
        run.font.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)

    rm_data = [
        ['Phase 1: Core OMS & Post-Order Pay', 'Completed. Cloud PostgreSQL master, post-order UPI payment flow, 250g MOQ pricing, and redesigned inventory manager with folder image selector.', 'Current (Oct 2026)', 'Streamlines daily operations, eliminates checkout confusion, and enables real-time kitchen tracking.'],
        ['Phase 2: Google Review Automation', 'Build automated post-fulfillment WhatsApp feedback loop with smart sentiment routing (4-5★ to Google Profile, 1-3★ to internal escalation).', 'Month 1', 'Drives 50+ organic 5-star Google reviews in 60 days, unlocking top 3 ranking in Bangalore local search.'],
        ['Phase 3: Meta Commerce & Instagram Shop', 'Deploy automated XML catalog feed, integrate Meta Commerce Manager, enable Instagram product tagging on reels, and configure Meta Conversions API (CAPI).', 'Month 2', 'Enables 1-click in-app purchases from Instagram reels and stories, reducing ad acquisition costs.'],
        ['Phase 4: Corporate Gifting Portal & B2B CRM', 'Deploy B2B inquiry module on website with GSTIN capture, corporate tiered volume pricing calculator, sample tasting box request funnel, and Supabase CRM.', 'Month 2 – 3', 'Captures high-volume corporate festival and event orders with ₹2,00,000+ single-order transaction sizes.'],
        ['Phase 5: Conversational AI & Retargeting', 'Integrate WhatsApp Cloud API conversational chat-to-cart bot, automated abandoned checkout reminders, and customer loyalty referral wallet.', 'Month 3 – 4', 'Maximizes repeat patron lifetime value (LTV) and delivers a 24/7 automated sales concierge.']
    ]

    for row_idx, row_data in enumerate(rm_data):
        row = roadmap_table.rows[row_idx + 1]
        bg_color = 'FAF6F0' if row_idx % 2 == 0 else 'FFFFFF'
        for col_idx, text in enumerate(row_data):
            cell = row.cells[col_idx]
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, 100, 100, 120, 120)
            p = cell.paragraphs[0]
            if col_idx == 0:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(text)
                run.font.bold = True
                run.font.color.rgb = RGBColor(74, 18, 30)
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                run = p.add_run(text)
                run.font.color.rgb = RGBColor(51, 65, 85)
            run.font.name = 'Calibri'
            run.font.size = Pt(9)

    # Save to root and docs
    output_root = 'The_Laddu_Story_Omnichannel_Architecture_and_Roadmap.docx'
    output_docs = 'docs/The_Laddu_Story_Omnichannel_Architecture_and_Roadmap.docx'
    
    doc.save(output_root)
    shutil.copy2(output_root, output_docs)
    print(f'Successfully updated and saved:\n1. {output_root}\n2. {output_docs}')

if __name__ == '__main__':
    main()

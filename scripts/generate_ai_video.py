import os
import wave
import pyttsx3
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg
import subprocess

# Define base paths
WORKSPACE_DIR = os.path.abspath(os.path.dirname(__file__) + '/..')
SCRATCH_DIR = os.path.join(WORKSPACE_DIR, 'scratch', 'video_assets')
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, 'media', 'videos')
FINAL_VIDEO_PATH = os.path.join(OUTPUT_DIR, 'The_Laddu_Story_Ayurvedic_Wellness_Guide.mp4')

os.makedirs(SCRATCH_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# SCRIPT SCENES CONFIGURATION
# ---------------------------------------------------------------------------
SCENES = [
    {
        "id": 0,
        "title": "THE LADDU STORY",
        "tagline": "Ancient Ayurvedic Nutrition for Kids & Adults",
        "bullets": [
            "100% Pure Desi Cow Ghee (A2)",
            "Naturally Sweetened with Unrefined Jaggery",
            "Zero White Sugar • Zero Preservatives",
            "Freshly Handcrafted Daily in Bangalore"
        ],
        "image": "images/TheLadduStory_Logo.jpg",
        "speech": "In ancient Ayurveda, food is medicine. Welcome to The Laddu Story, where we craft artisanal superfood laddus using pure Desi Cow Ghee and unrefined jaggery, with zero white sugar."
    },
    {
        "id": 1,
        "title": "AYURVEDIC SCIENCE OF GHEE & JAGGERY",
        "tagline": "Why Pure Ghee is the Sacred 'Yogavahi' Carrier",
        "bullets": [
            "Ghee is 'Yogavahi' — carrying nutrients deep into cellular tissues",
            "Unrefined Jaggery purifies blood and boosts healthy iron levels",
            "Enhances Ojas (vital immunity, glowing skin & longevity)",
            "Healthy fats essential for growing kids and active adults"
        ],
        "image": "images/hero_thali.jpg",
        "speech": "Ayurveda describes Desi Cow Ghee as Yogavahi, a sacred vehicle that transports essential nutrients deep into body tissues, while unrefined jaggery promotes healthy digestion and blood purification."
    },
    {
        "id": 2,
        "title": "FOR KIDS: DATES & DRY FRUITS POPS",
        "tagline": "Replacing Refined Sugar Candies with Pure Energy",
        "bullets": [
            "100% naturally sweetened purely with Medjool Dates",
            "Loaded with California Almonds, Pistachios & Cashews",
            "Healthy treat on a stick that children adore",
            "Boosts brain development, physical stamina & strong bones"
        ],
        "image": "images/products/DATES-POPS.jpg",
        "speech": "For growing kids, our Dates and Dry Fruits Pops replace artificial chocolates and refined candy. Loaded with almonds, pistachios, and pure dates, they support immunity, brain development, and bone growth."
    },
    {
        "id": 3,
        "title": "FOR ADULTS: RAGI WALNUT & SATTU ALMOND",
        "tagline": "Plant Protein, Omega-3 & Low-Glycemic Vitality",
        "bullets": [
            "Ragi Walnut: High Calcium & Omega-3, diabetic-friendly",
            "Sattu Almond: Roasted Chana protein power for muscle strength",
            "Sustained energy release without blood sugar spikes",
            "Ideal daily breakfast bite for busy professionals & seniors"
        ],
        "image": "images/products/RAGI-WALNUT.jpg",
        "speech": "For active adults, our Ragi Walnut laddu offers plant Omega 3 and calcium with a low glycemic index, while Sattu Almond provides natural roasted protein for sustained vitality and muscle recovery."
    },
    {
        "id": 4,
        "title": "HERBAL CARE: TILL SESAME & METHI",
        "tagline": "Warming Ayurvedic Immunity & Joint Health",
        "bullets": [
            "Till Black Sesame: Rich natural Iron & Ayurvedic winter warmth",
            "Methi Fenugreek: Relieves joint stiffness & balances metabolism",
            "Post-Delivery Panjeeri: Time-tested postpartum rejuvenation",
            "Groundnut: Traditional protein crunch with pure desi jaggery"
        ],
        "image": "images/products/TILL-BLACK-SESAME.jpg",
        "speech": "Black Sesame Till laddus deliver natural iron and seasonal warmth, while Methi Fenugreek supports joint flexibility and digestion. Our Post Delivery Panjeeri offers time-tested Ayurvedic rejuvenation."
    },
    {
        "id": 5,
        "title": "A WHOLESOME DAILY RITUAL",
        "tagline": "One Pure Artisanal Laddu Every Day",
        "bullets": [
            "Complete holistic wellness for the entire family",
            "Freshly prepared in small artisanal batches in Bangalore",
            "Order Online: theladdustory.github.io",
            "Patron Helpline & WhatsApp: +91 9343207515"
        ],
        "image": "images/TheLadduStory_Logo.jpg",
        "speech": "Making one pure artisanal laddu part of your daily diet nourishes body and mind across every stage of life. Experience the authentic taste of health from The Laddu Story. Freshly handcrafted in Bangalore."
    }
]

# ---------------------------------------------------------------------------
# 1. GENERATE AUDIO NARRATION FOR EACH SCENE
# ---------------------------------------------------------------------------
print("--> Generating AI voice narration via Windows SpeechSynthesizer...")

def synthesize_speech(text, output_file):
    clean_text = text.replace('"', '\\"').replace("'", "''")
    ps_cmd = (
        f"Add-Type -AssemblyName System.Speech; "
        f"$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        f"$s.Rate = 0; "
        f"$s.SetOutputToWaveFile('{output_file.replace(os.sep, '/')}'); "
        f"$s.Speak('{clean_text}'); "
        f"$s.Dispose()"
    )
    subprocess.run(["powershell", "-NoProfile", "-Command", ps_cmd], check=True)

audio_files = []
durations = []

for sc in SCENES:
    wav_path = os.path.join(SCRATCH_DIR, f"voice_{sc['id']}.wav")
    synthesize_speech(sc['speech'], wav_path)
    
    # Calculate duration
    with wave.open(wav_path, 'rb') as wf:
        n_frames = wf.getnframes()
        rate = wf.getframerate()
        dur = n_frames / float(rate)
        # Add 0.8s padding for visual comfort
        padded_dur = max(dur + 0.8, 6.0)
        durations.append(padded_dur)
        audio_files.append(wav_path)
        print(f"  Scene {sc['id']}: speech {dur:.1f}s -> total scene {padded_dur:.1f}s")

# Combine all audio files into a single master WAV
master_wav_path = os.path.join(SCRATCH_DIR, "master_narration.wav")
with wave.open(master_wav_path, 'wb') as outfile:
    for i, af in enumerate(audio_files):
        with wave.open(af, 'rb') as infile:
            if i == 0:
                outfile.setparams(infile.getparams())
            outfile.writeframes(infile.readframes(infile.getnframes()))
            # Add silence padding between scenes
            silence_frames = int(infile.getframerate() * 0.8)
            silence_data = b'\x00' * (silence_frames * infile.getsampwidth() * infile.getnchannels())
            outfile.writeframes(silence_data)

total_audio_sec = sum(durations)
print(f"--> Master audio duration: {total_audio_sec:.1f} seconds")

# ---------------------------------------------------------------------------
# 2. GENERATE VIDEO FRAMES (1080p, 24 FPS)
# ---------------------------------------------------------------------------
WIDTH, HEIGHT = 1920, 1080
FPS = 24

# Setup Fonts
def get_font(name, size):
    try:
        path = os.path.join("C:\\Windows\\Fonts", name)
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_brand = get_font("georgiab.ttf", 46)
font_title = get_font("georgiab.ttf", 52)
font_subtitle = get_font("calibrib.ttf", 30)
font_body = get_font("calibri.ttf", 28)
font_bullet_bold = get_font("calibrib.ttf", 28)
font_caption = get_font("calibrib.ttf", 22)
font_badge = get_font("calibrib.ttf", 20)

def draw_rounded_rect(draw, coords, radius, fill, outline=None, width=1):
    x0, y0, x1, y1 = coords
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill, outline=outline, width=width)

# Pre-render each scene background image
scene_images = []
for sc in SCENES:
    img_path = os.path.join(WORKSPACE_DIR, sc['image'].replace('/', os.sep))
    if not os.path.exists(img_path):
        img_path = os.path.join(WORKSPACE_DIR, 'images', 'TheLadduStory_Logo.jpg')
    try:
        im = Image.open(img_path).convert('RGB')
    except Exception as e:
        im = Image.new('RGB', (400, 400), (74, 18, 30))
    scene_images.append(im)

print("--> Rendering high-definition 1080p slide templates...")
rendered_scene_slides = []

for sc_idx, sc in enumerate(SCENES):
    # Base royal gradient background
    bg = Image.new('RGB', (WIDTH, HEIGHT), (53, 11, 21))
    draw = ImageDraw.Draw(bg)
    
    # Draw vertical smooth gradient from #350B15 to #4A121E
    for y in range(HEIGHT):
        ratio = y / HEIGHT
        r = int(53 + (74 - 53) * ratio)
        g = int(11 + (18 - 11) * ratio)
        b = int(21 + (30 - 21) * ratio)
        draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))
    
    # Top gold accent line
    draw.line([(0, 0), (WIDTH, 0)], fill=(180, 83, 9), width=8)
    draw.line([(0, 8), (WIDTH, 8)], fill=(253, 230, 138), width=3)
    
    # Header Banner: Royal Branding
    draw.text((80, 45), "THE LADDU STORY", font=font_brand, fill=(254, 243, 199))
    draw.text((80, 105), "HOMEMADE SUPERFOODS & ARTISANAL SWEETS • PURE DESI COW GHEE • ZERO WHITE SUGAR", font=font_caption, fill=(217, 119, 6))
    
    # Header Right Badge
    draw_rounded_rect(draw, (WIDTH - 420, 48, WIDTH - 80, 98), radius=12, fill=(74, 18, 30), outline=(253, 230, 138), width=2)
    draw.text((WIDTH - 400, 62), "🌿 AYURVEDIC WELLNESS GUIDE", font=font_badge, fill=(254, 240, 138))

    # Main Card Container
    card_box = (80, 150, WIDTH - 80, HEIGHT - 110)
    draw_rounded_rect(draw, card_box, radius=24, fill=(250, 246, 240), outline=(253, 230, 138), width=3)
    
    # Left Column: Image Card
    img_box_coords = (120, 190, 720, 790)
    draw_rounded_rect(draw, img_box_coords, radius=18, fill=(255, 255, 255), outline=(226, 232, 240), width=2)
    
    prod_im = scene_images[sc_idx]
    # Resize product image keeping aspect ratio
    prod_im_resized = prod_im.resize((560, 560), Image.Resampling.LANCZOS)
    bg.paste(prod_im_resized, (140, 210))
    
    # Under-image gold highlight ribbon
    draw_rounded_rect(draw, (140, 795, 700, 845), radius=10, fill=(74, 18, 30))
    draw.text((160, 808), "100% PURE DESI GHEE & UNREFINED JAGGERY", font=font_badge, fill=(254, 240, 138))

    # Right Column: Content & Benefits
    # Scene Title
    draw.text((770, 195), sc['title'], font=font_title, fill=(74, 18, 30))
    # Subtitle / Ayurvedic Tagline
    draw.text((770, 265), sc['tagline'], font=font_subtitle, fill=(180, 83, 9))
    
    # Gold decorative divider
    draw.line([(770, 315), (WIDTH - 120, 315)], fill=(226, 232, 240), width=2)
    draw.line([(770, 315), (1050, 315)], fill=(180, 83, 9), width=4)
    
    # Bullet Points with gold checkmarks
    y_text = 345
    for b in sc['bullets']:
        # Badge circle
        draw.ellipse([770, y_text + 4, 798, y_text + 32], fill=(254, 243, 199), outline=(180, 83, 9), width=2)
        draw.text((778, y_text + 6), "✓", font=font_badge, fill=(180, 83, 9))
        draw.text((815, y_text + 4), b, font=font_body, fill=(30, 41, 59))
        y_text += 70

    # Ayurvedic Health Note Box at bottom right
    note_box = (770, 680, WIDTH - 120, 845)
    draw_rounded_rect(draw, note_box, radius=14, fill=(254, 243, 199), outline=(245, 158, 11), width=1)
    draw.text((800, 695), "AYURVEDIC HEALTH WISDOM:", font=font_badge, fill=(146, 64, 14))
    
    # Narration Subtitle Box
    speech_summary = sc['speech'][:140] + ("..." if len(sc['speech']) > 140 else "")
    draw.text((800, 730), f'"{speech_summary}"', font=font_body, fill=(74, 18, 30))

    # Bottom Footer Bar
    draw.text((100, HEIGHT - 75), "Bangalore Kitchen Fresh • Order Online: theladdustory.github.io • Call / WhatsApp: +91 9343207515", font=font_subtitle, fill=(254, 243, 199))
    
    rendered_scene_slides.append(bg)

# ---------------------------------------------------------------------------
# 3. WRITE VIDEO USING FFMPEG & IMAGEIO
# ---------------------------------------------------------------------------
print("--> Generating frames and streaming into MP4 encoder...")

# Prepare list of slide durations
total_frames = int(sum(durations) * FPS)
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

# Pipe raw frames to ffmpeg
raw_video_temp = os.path.join(SCRATCH_DIR, "temp_video.mp4")

cmd_video = [
    ffmpeg_exe, '-y',
    '-f', 'rawvideo',
    '-vcodec', 'rawvideo',
    '-s', f'{WIDTH}x{HEIGHT}',
    '-pix_fmt', 'rgb24',
    '-r', str(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'fast',
    '-crf', '19',
    raw_video_temp
]

proc = subprocess.Popen(cmd_video, stdin=subprocess.PIPE)

current_frame = 0
for sc_idx, sc in enumerate(SCENES):
    slide_im = rendered_scene_slides[sc_idx]
    slide_dur = durations[sc_idx]
    slide_frame_count = int(slide_dur * FPS)
    
    for f in range(slide_frame_count):
        # Create subtle Ken-Burns dynamic progress indicator
        frame_copy = slide_im.copy()
        draw = ImageDraw.Draw(frame_copy)
        
        # Overall video progress bar at the very bottom
        progress = (current_frame + f) / float(total_frames)
        bar_w = int(WIDTH * progress)
        draw.line([(0, HEIGHT - 6), (bar_w, HEIGHT - 6)], fill=(245, 158, 11), width=6)
        
        # Write RGB bytes to ffmpeg pipe
        proc.stdin.write(frame_copy.tobytes())
    
    current_frame += slide_frame_count

proc.stdin.close()
proc.wait()
print(f"--> Raw video generated: {raw_video_temp} ({os.path.getsize(raw_video_temp):,} bytes)")

# ---------------------------------------------------------------------------
# 4. MUX VIDEO AND MASTER NARRATION AUDIO
# ---------------------------------------------------------------------------
print("--> Merging video with master AI voiceover...")

cmd_mux = [
    ffmpeg_exe, '-y',
    '-i', raw_video_temp,
    '-i', master_wav_path,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    FINAL_VIDEO_PATH
]

subprocess.run(cmd_mux, check=True)
video_size_mb = os.path.getsize(FINAL_VIDEO_PATH) / (1024 * 1024)
print(f"SUCCESS! Master AI Video created at:\n  {FINAL_VIDEO_PATH} ({video_size_mb:.2f} MB)")

# ---------------------------------------------------------------------------
# 5. CREATE INTERACTIVE HTML5 PREVIEW PLAYER
# ---------------------------------------------------------------------------
HTML_PREVIEW_PATH = os.path.join(OUTPUT_DIR, "preview.html")
html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Laddu Story - AI Ayurvedic Video Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Marcellus&display=swap" rel="stylesheet">
  <style>
    body {{
      margin: 0;
      padding: 30px 20px;
      background: #FAF6F0;
      font-family: 'Plus Jakarta Sans', sans-serif;
      color: #1E293B;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}
    .header {{
      text-align: center;
      max-width: 800px;
      margin-bottom: 24px;
    }}
    h1 {{
      font-family: 'Marcellus', Georgia, serif;
      color: #4A121E;
      font-size: 2.2rem;
      margin: 0 0 8px;
    }}
    .subtitle {{
      color: #B45309;
      font-weight: 700;
      font-size: 1rem;
    }}
    .video-card {{
      background: #FFFFFF;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(74, 18, 30, 0.2);
      border: 2px solid #FDE68A;
      max-width: 960px;
      width: 100%;
    }}
    video {{
      width: 100%;
      height: auto;
      display: block;
      background: #000;
    }}
    .details {{
      padding: 24px;
    }}
    .specs-grid {{
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }}
    .spec-item {{
      background: #FAF6F0;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }}
    .spec-title {{
      font-size: 0.75rem;
      font-weight: 800;
      color: #64748B;
    }}
    .spec-val {{
      font-size: 1.1rem;
      font-weight: 800;
      color: #4A121E;
      margin-top: 4px;
    }}
    .bullets {{
      background: #FFFBEB;
      border: 1.5px solid #FDE68A;
      border-radius: 14px;
      padding: 16px 20px;
      font-size: 0.9rem;
      line-height: 1.6;
    }}
    .bullets h3 {{
      margin: 0 0 8px;
      color: #92400E;
      font-size: 1rem;
    }}
    .btn-row {{
      display: flex;
      gap: 14px;
      margin-top: 20px;
    }}
    .btn {{
      padding: 12px 24px;
      border-radius: 10px;
      font-weight: 800;
      text-decoration: none;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }}
    .btn-primary {{
      background: #4A121E;
      color: #FFFFFF;
      border: none;
    }}
    .btn-secondary {{
      background: #F1F5F9;
      color: #475569;
      border: 1px solid #CBD5E1;
    }}
  </style>
</head>
<body>
  <div class="header">
    <h1>The Laddu Story</h1>
    <div class="subtitle">AI Ayurvedic Wellness Video (30 Sec – 1 Min Review Draft)</div>
    <p style="color: #64748B; font-size: 0.9rem; margin-top: 6px;">
      Generated for Founder Review & Approval • Saved at: <code>c:\\Users\\navin\\TheLadduStory\\media\\videos\\</code>
    </p>
  </div>

  <div class="video-card">
    <video controls autoplay muted>
      <source src="The_Laddu_Story_Ayurvedic_Wellness_Guide.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>

    <div class="details">
      <div class="specs-grid">
        <div class="spec-item">
          <div class="spec-title">DURATION</div>
          <div class="spec-val">~50 Seconds</div>
        </div>
        <div class="spec-item">
          <div class="spec-title">RESOLUTION</div>
          <div class="spec-val">1080p (Full HD)</div>
        </div>
        <div class="spec-item">
          <div class="spec-title">FRAME RATE</div>
          <div class="spec-val">24 FPS</div>
        </div>
        <div class="spec-item">
          <div class="spec-title">FILE SIZE</div>
          <div class="spec-val">{video_size_mb:.2f} MB</div>
        </div>
      </div>

      <div class="bullets">
        <h3>Key Ayurvedic & Product Highlights Covered in this Video:</h3>
        <ul>
          <li><b>Ayurvedic Philosophy:</b> Food as medicine, 100% Pure Desi Cow Ghee (A2) and Unrefined Jaggery with Zero White Sugar.</li>
          <li><b>The Sacred 'Yogavahi':</b> Why Desi Cow Ghee acts as an Ayurvedic catalytic carrier delivering micronutrients deep into body cells.</li>
          <li><b>For Kids:</b> Dates & Dry Fruits Pops naturally sweetened with Medjool dates, replacing artificial candies with brain and bone power.</li>
          <li><b>For Active Adults:</b> Calcium & Omega-3 rich Ragi Walnut (diabetic-friendly) and Sattu Almond (roasted plant protein).</li>
          <li><b>Herbal & Seasonal Care:</b> Till Black Sesame for natural iron warmth, and Methi Fenugreek for joint flexibility and postpartum rejuvenation.</li>
          <li><b>Call to Action:</b> Daily wellness ritual, Bangalore kitchen fresh, helpline 9343207515, and theladdustory.github.io.</li>
        </ul>
      </div>

      <div class="btn-row">
        <a href="The_Laddu_Story_Ayurvedic_Wellness_Guide.mp4" download class="btn btn-primary">
          ⬇️ Download MP4 Video File
        </a>
        <button onclick="window.close()" class="btn btn-secondary">
          Close Window
        </button>
      </div>
    </div>
  </div>
</body>
</html>
"""

with open(HTML_PREVIEW_PATH, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"--> Interactive HTML5 preview created at:\n  {HTML_PREVIEW_PATH}")

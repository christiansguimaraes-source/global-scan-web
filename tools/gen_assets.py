from PIL import Image, ImageDraw, ImageFont
import os
o='_site/icons'; s='_site/screenshots'; os.makedirs(s,exist_ok=True)
src=Image.open(f'{o}/icon-512.png').convert('RGBA')
src.resize((1024,1024),Image.LANCZOS).save(f'{o}/icon-1024.png')
for n in (512,1024):
    bg=Image.new('RGBA',(n,n),(14,14,14,255)); k=int(n*0.7)
    ic=src.resize((k,k),Image.LANCZOS); bg.paste(ic,((n-k)//2,(n-k)//2),ic); bg.save(f'{o}/icon-maskable-{n}.png')
def font(z):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',):
        if os.path.exists(p): return ImageFont.truetype(p,z)
    return ImageFont.load_default()
def shot(w,h,name):
    im=Image.new('RGB',(w,h),(14,14,14)); d=ImageDraw.Draw(im)
    k=min(w,h)//4; ic=src.resize((k,k),Image.LANCZOS); im.paste(ic,((w-k)//2,h//5),ic)
    for i,(t,z) in enumerate((('Global Scan',k//3),('Digitalize documentos em PDF',k//7))):
        f=font(z); b=d.textbbox((0,0),t,font=f); d.text(((w-(b[2]-b[0]))//2,h//5+k+40+i*int(k/2.5)),t,fill=(219,186,106),font=f)
    d.rounded_rectangle((w//6,int(h*0.62),w-w//6,int(h*0.9)),radius=20,outline=(132,112,62),width=4)
    im.save(f'{s}/{name}')
shot(1280,720,'wide.png'); shot(750,1334,'narrow.png')

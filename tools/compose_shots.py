# Compose the standard screenshots into one labeled contact sheet.
import sys,glob,os
from PIL import Image,ImageDraw
d=sys.argv[1];files=sorted(glob.glob(os.path.join(d,'[0-9][0-9]-*.png')));cols=6;W,H=360,629;sc=.5
w,h=int(W*sc),int(H*sc);rows=(len(files)+cols-1)//cols;sheet=Image.new('RGB',(cols*w,rows*(h+18)),'#0d0f12');dr=ImageDraw.Draw(sheet)
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((w,h));x,y=(i%cols)*w,(i//cols)*(h+18);sheet.paste(im,(x,y+18));dr.text((x+4,y+3),os.path.basename(f)[:-4],fill='#d8a86a')
sheet.save(os.path.join(d,'sheet.png'));print('sheet',sheet.size)

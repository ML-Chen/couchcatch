import sys
draw = open(sys.argv[1]).read()
t = open('game.html').read().replace('//@@SPECIES@@', open('species.js').read()).replace('//@@DRAW@@', draw).replace('//@@SFX@@', open('sfx.js').read() if __import__('os').path.exists('sfx.js') else '')
import os
opt=lambda f: open(f).read() if os.path.exists(f) else ''
t=t.replace('//@@ZH@@',opt('zh_names.js')).replace('//@@VOCAB@@',opt('vocab.js')).replace('//@@AUDIO@@',opt('zh_audio.js')).replace('//@@FX@@',opt('fx.js')).replace('//@@PHRASES@@',opt('phrases.js')).replace('//@@DIALOGUES@@',opt('dialogues.js')+'\n'+opt('dialogues_a.js')+'\n'+opt('dialogues_b.js')+'\n'+opt('story_dialogues.js')).replace('//@@TYPES@@',opt('types_ext.js')).replace('//@@SPEAK@@',opt('speak.js')).replace('//@@HSK@@',opt('hsk_chars.js')).replace('//@@HANZI@@',opt('hanzi_writer.js')).replace('//@@TRACE@@',opt('trace.js')).replace('//@@READINGS@@',opt('readings.js')+'\n'+opt('story_readings.js')).replace('//@@READER@@',opt('reader.js')).replace('//@@ORB@@',opt('orb.js')).replace('//@@STORY@@',opt('story.js')).replace('//@@DEX@@',opt('dex.js')).replace('/*@@THEME@@*/',opt('theme_glass.css')).replace('//@@SCENERY@@',opt('scenery_home.js')+'\n'+opt('scenery_ca.js'))
# Asia regions: places inline after PLACES; scenery, conversations, readings and runtime hooks at the end of the page
t=t.replace('//@@PLACES_ASIA@@',opt('places_asia.js')).replace('//@@ASIA@@','\n'.join(opt(f) for f in ['scenery_asia.js','asia_dialogues.js','asia_readings.js','asia.js']))
# playing together on one phone: trading and friendly battles (wraps a few game functions, so it loads last)
t=t.replace('//@@TOGETHER@@',opt('together.js'))
open(sys.argv[2],'w').write(t)

"""Emit a `specimens:` YAML block from Python structures, so hand-indentation
never becomes the reason a content file fails validation."""
import re

def q(text: str) -> str:
    return '"' + text.replace('\\', '\\\\').replace('"', '\\"') + '"'

def block(specimens) -> str:
    out = ['specimens:']
    for sp in specimens:
        out.append('  -')
        out.append(f'    kind: {q(sp["kind"])}')
        out.append(f'    label: {q(sp["label"])}')
        if sp.get('subject'):
            out.append(f'    subject: {q(sp["subject"])}')
        if sp.get('context'):
            out.append(f'    context: {q(sp["context"])}')
        out.append('    lines:')
        for line in sp['lines']:
            out.append('      -')
            if line.get('speaker'):
                out.append(f'        speaker: {q(line["speaker"])}')
            if line.get('at'):
                out.append(f'        at: {q(line["at"])}')
            out.append(f'        text: {q(line["text"])}')
            if line.get('tell'):
                out.append('        tell: true')
        if sp.get('reading'):
            out.append(f'    reading: {q(sp["reading"])}')
    return '\n'.join(out) + '\n'

def attach(path: str, specimens, anchor: str = 'non_inferences:') -> None:
    s = open(path).read()
    if 'specimens:' in s:
        s = re.sub(r'specimens:\n(?:[ ]+.*\n)+?(?=\w)', '', s)
    assert anchor in s, (path, anchor)
    s = s.replace(anchor, block(specimens) + anchor, 1)
    open(path, 'w').write(s)

def pair(entity: str, en, uk) -> None:
    attach(f'content/{entity}.md', en)
    attach(f'content-uk/{entity}.md', uk)

import io

p = 'about.html'
s = io.open(p, encoding='utf-8').read()

BLOCK = r"""
  <!-- ===================== OUR COMMUNITY ===================== -->
  <section class="deo-section" id="community">
    <div class="wrap">
      <div class="deo-section-head">
        <p class="deo-eyebrow">Our Community</p>
        <h2>A school is the people in it.</h2>
      </div>

      <div class="community-content">
        <div class="people-row">
          <div class="person-block">
            <b>Students</b>
            <p>Given room to become themselves, inside a group that notices when someone is missing.</p>
          </div>
          <div class="person-block">
            <b>Teachers</b>
            <p>German-trained and Egyptian colleagues working from one staffroom, not two.</p>
          </div>
          <div class="person-block">
            <b>Parents</b>
            <p>Part of how the school runs, with a real say rather than a suggestion box.</p>
          </div>
          <div class="person-block">
            <b>Community</b>
            <p>A wider circle of alumni and families that stretches across two countries.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ===================== OUR VALUES ===================== -->
  <section class="deo-section deo-section--tint" id="values">
    <div class="wrap">
      <div class="deo-section-head deo-section-head--center">
        <p class="deo-eyebrow">Our Values</p>
        <h2>What the school holds to.</h2>
      </div>

      <div class="values">
        <div class="value-block"><b>Encounter</b><p>Difference met directly, not managed at a distance.</p></div>
        <div class="value-block"><b>Responsibility</b><p>Freedom that comes with something to answer for.</p></div>
        <div class="value-block"><b>Respect</b><p>Room for other answers, including uncomfortable ones.</p></div>
        <div class="value-block"><b>Participation</b><p>A real part in decisions, at every age.</p></div>
        <div class="value-block"><b>Future</b><p>Preparing for a world that will keep changing.</p></div>
      </div>
    </div>
  </section>

"""

assert 'id="community"' not in s and 'id="values"' not in s, 'already present'

# Insert before the closing section, keeping the user's reordered flow intact.
marker = '  <!-- ===================== 10. CLOSING ===================== -->'
if marker not in s:
    marker = '  <section class="deo-closing"'
i = s.index(marker)
s = s[:i] + BLOCK + s[i:]

io.open(p, 'w', encoding='utf-8').write(s)
print('restored. sections now:', s.count('<section'))

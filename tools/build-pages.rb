# GULF NEXT — stamps the shared <head>, header and footer into each page.
# Edit page bodies in tools/pages/*.html, then run:  ruby tools/build-pages.rb
ROOT = File.expand_path('..', __dir__)
PAGES = {
  'index'      => { title: 'GULF NEXT Oil and Gas | Energy infrastructure, engineered for what\'s next', desc: 'Integrated engineering, construction and operations support for the oil, gas and petrochemical sector.', poster: 'scene-01-homepage-opening', nav: 'Home' },
  'about'      => { title: 'About Us | GULF NEXT Oil and Gas', desc: 'Who we are: a Gulf-based partner for oil, gas and petrochemical engineering.', poster: 'scene-10-about-us', nav: 'About' },
  'services'   => { title: 'Services | GULF NEXT Oil and Gas', desc: 'Upstream support, mechanical engineering, facilities construction, maintenance and supply.', poster: 'scene-05-mechanical-engineering', nav: 'Services' },
  'industries' => { title: 'Industries | GULF NEXT Oil and Gas', desc: 'Onshore, offshore, refining, gas processing, midstream and power.', poster: 'scene-12-industries', nav: 'Industries' }
}
NAV = [['Home', 'index.html'], ['About', 'about.html'], ['Services', 'services.html'], ['Industries', 'industries.html']]

PAGES.each do |slug, p|
  body = File.read(File.join(__dir__, 'pages', "#{slug}.html"))
  # Hero poster for the first hero is preloaded so it paints immediately (LCP).
  # Keep in sync with assets/js/media-map.js if a hero's scene changes.
  nav = NAV.map { |label, href|
    cur = label == p[:nav] ? ' aria-current="page"' : ''
    %(          <li><a href="#{href}"#{cur}>#{label}</a></li>)
  }.join("\n")
  html = <<~HTML
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
      <title>#{p[:title]}</title>
      <meta name="description" content="#{p[:desc]}">
      <meta name="theme-color" content="#040c1c">
      <link rel="icon" type="image/webp" href="assets/brand/logo.webp">
      <link rel="preload" as="image" href="assets/media/posters/#{p[:poster]}.jpg" media="(min-width: 769px)" fetchpriority="high">
      <link rel="preload" as="image" href="assets/media/posters/#{p[:poster]}-sm.jpg" media="(max-width: 768px)" fetchpriority="high">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&family=Inter:wght@400;500;600&display=swap">
      <link rel="stylesheet" href="assets/css/main.css">
      <script>document.documentElement.classList.add('js')</script>
    </head>
    <body>
      <a class="skip-link" href="#main">Skip to content</a>
      <header class="site-header">
        <div class="container">
          <a class="brand" href="index.html" aria-label="GULF NEXT Oil and Gas, home">
            <img src="assets/brand/logo.webp" alt="GULF NEXT Oil and Gas" width="580" height="430">
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z"/></svg>
          </button>
          <nav class="site-nav" id="site-nav" aria-label="Main">
            <ul class="nav-list">
    #{nav}
              <li class="nav-cta"><a href="#contact">Contact us</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
    #{body.rstrip}
      </main>

      <footer class="site-footer" id="contact">
        <div class="container">
          <div class="footer-grid">
            <div>
              <a class="brand" href="index.html" aria-label="GULF NEXT Oil and Gas, home">
                <img src="assets/brand/logo.webp" alt="GULF NEXT Oil and Gas" width="580" height="430" loading="lazy">
              </a>
              <p class="footer-about">Engineering, construction and operations support for the oil, gas and petrochemical sector.</p>
            </div>
            <nav aria-label="Footer">
              <h2>Company</h2>
              <ul>
    #{NAV.map { |l, h| %(            <li><a href="#{h}">#{l}</a></li>) }.join("\n")}
              </ul>
            </nav>
            <div>
              <h2>Contact</h2>
              <!-- TODO: add official phone, email and office address. -->
              <p>Tell us about your project and our team will be in touch.</p>
            </div>
          </div>
          <p class="footer-base">&copy; <span data-year>2026</span> GULF NEXT Oil and Gas. All rights reserved.</p>
        </div>
      </footer>

      <!-- Order matters: media map, then component, then page behaviour. -->
      <script src="assets/js/media-map.js"></script>
      <script src="assets/js/cinematic-hero.js"></script>
      <script src="assets/js/main.js"></script>
    </body>
    </html>
  HTML
  File.write(File.join(ROOT, "#{slug}.html"), html)
  puts "wrote #{slug}.html"
end

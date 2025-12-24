function renderFooter(basePath = "") {
    const footerHTML = `
    <footer class="site-footer dynamic-electronic">
        <div class="signal-grid" aria-hidden="true">
            <div class="signal-line horizontal"></div>
            <div class="signal-line vertical"></div>
            <div class="bolt-emitter left"></div>
            <div class="bolt-emitter right"></div>
        </div>

        <div class="footer-container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="footer-logo glitch-hover">
                        <img src="${basePath}assets/logo.png" alt="Pixel Phantoms Logo">
                        <span class="brand-name neon-text">Pixel Phantoms</span>
                    </div>
                    <p class="footer-description">
                        > Initializing community_outreach.exe...<br>
                        > Status: <span class="highlight-green">ENCRYPTED</span>
                    </p>
                    <div class="social-links dynamic-signals">
                        <a href="https://github.com/sayeeg-11/Pixel_Phantoms" class="social-link" target="_blank" rel="noopener"><i class="fab fa-github"></i></a>
                        <a href="https://www.instagram.com/pixelphantoms_" class="social-link" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
                        <a href="https://discord.com/" class="social-link" target="_blank" rel="noopener"><i class="fab fa-discord"></i></a>
                        <a href="https://www.linkedin.com/company/pixel-phantoms/" class="social-link" target="_blank" rel="noopener"><i class="fab fa-linkedin"></i></a>
                    </div>
                </div>

                <div class="footer-links-grid">
                    <div class="link-group">
                        <h3 class="link-group-title terminal-header">EXPLORE_PATH</h3>
                        <ul class="link-list">
                            <li><a href="${basePath}index.html" class="signal-hover">Home_Node</a></li>
                            <li><a href="${basePath}about.html" class="signal-hover">About_System</a></li>
                            <li><a href="${basePath}pages/contributors.html" class="signal-hover">Core_Team</a></li>
                            <li><a href="${basePath}events.html" class="signal-hover">Live_Events</a></li>
                        </ul>
                    </div>
                    <div class="link-group">
                        <h3 class="link-group-title terminal-header">SUPPORT_PROTOCOLS</h3>
                        <ul class="link-list">
                            <li><a href="${basePath}contact.html" class="signal-hover">Contact_Admin</a></li>
                            <li><a href="${basePath}pages/help.html" class="signal-hover">Help_Center</a></li>
                            <li><a href="${basePath}pages/privacy.html" class="signal-hover">Privacy_Shield</a></li>
                        </ul>
                    </div>
                </div>

                <div class="footer-newsletter">
                    <h3 class="newsletter-title terminal-header">LINK_SIGNAL</h3>
                    <p class="newsletter-description">Sync your email for global updates.</p>
                    <form class="newsletter-form-dynamic">
                        <div class="input-group-cyber">
                            <input type="email" class="newsletter-input" placeholder="user@phantom.io" required>
                            <button type="submit" class="newsletter-btn"><i class="fas fa-bolt"></i></button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p class="copyright">&copy; 2025 PIXEL_PHANTOMS // ALL_RIGHTS_RESERVED</p>
                    <div class="binary-decor" aria-hidden="true">01001000 01001001</div>
                </div>
            </div>
        </div>
    </footer>
    `;
    const placeholder = document.getElementById("footer-placeholder");
    if (placeholder) placeholder.innerHTML = footerHTML;
}
// TTRS Bot Bookmarklet Generator
// This file creates a bookmarklet that loads and runs the bot

(function() {
  // Read bot.js and create bookmarklet
  const botScriptUrl = 'https://raw.githubusercontent.com/willjudd747-jpg/w-ttrs-bot/main/bot.js';

  // Create instructions
  const instructions = document.createElement('div');
  instructions.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #050505;
    border: 2px solid #ff2d78;
    border-radius: 12px;
    padding: 30px;
    max-width: 500px;
    color: #fff;
    font-family: 'Courier New', monospace;
    z-index: 999999;
    box-shadow: 0 0 40px rgba(255,45,120,.5);
    line-height: 1.6;
  `;

  instructions.innerHTML = `
    <h2 style="color: #ff2d78; margin-top: 0; letter-spacing: 2px;">⚡ TTRS Bot Setup</h2>
    <p>Copy the code below and create a new bookmark in your browser:</p>
    
    <div style="
      background: #0d0d0d;
      border: 1px solid #2a2a2a;
      padding: 12px;
      border-radius: 6px;
      margin: 15px 0;
      max-height: 200px;
      overflow-y: auto;
      word-break: break-all;
      font-size: 11px;
    " id="bookmarklet">
      Loading bookmarklet code...
    </div>

    <button id="copyBtn" style="
      width: 100%;
      padding: 12px;
      background: linear-gradient(90deg, #c2006e, #ff2d78);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
      margin-bottom: 10px;
      transition: all .2s;
      font-family: 'Courier New', monospace;
    ">📋 COPY BOOKMARKLET</button>

    <p style="font-size: 12px; color: #888; margin-bottom: 0;">
      <strong style="color: #ffd54f;">Instructions:</strong><br>
      1. Click "COPY BOOKMARKLET"<br>
      2. Create a new bookmark in your browser<br>
      3. Paste the code into the URL field<br>
      4. Visit any TTRS page and click the bookmark
    </p>
  `;

  document.body.appendChild(instructions);

  // Create overlay
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 999998;
  `;
  document.body.appendChild(overlay);

  // Generate bookmarklet
  const bookmarkletCode = `javascript:(function(){fetch('https://raw.githubusercontent.com/willjudd747-jpg/w-ttrs-bot/main/bot.js').then(r=>r.text()).then(code=>eval(code)).catch(e=>alert('Error loading bot: '+e.message))})();`;

  document.getElementById('bookmarklet').textContent = bookmarkletCode;

  // Copy functionality
  document.getElementById('copyBtn').addEventListener('click', function() {
    navigator.clipboard.writeText(bookmarkletCode).then(() => {
      const btn = this;
      const original = btn.textContent;
      btn.textContent = '✅ COPIED!';
      btn.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
      setTimeout(() => {
        btn.textContent = original;
        btn.style.background = 'linear-gradient(90deg, #c2006e, #ff2d78)';
      }, 2000);
    }).catch(() => {
      alert('Failed to copy. Please try again.');
    });
  });
})();

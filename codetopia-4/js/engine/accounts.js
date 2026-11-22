/* Accounts. Everything lives in this browser: the account list, a salted password hash and one save slot per account.
   There is no server, so an account does not follow the player to another device or browser. */

"use strict";

const Accounts = (() => {
  const LIST = "codetopia.accounts.v1", SESSION = "codetopia.session.v1", SAVE = "codetopia.save.v1.";
  let memList = { users:{} }, memSession = null;
  const read = k => { try { const s = localStorage.getItem(k); if (s) return JSON.parse(s); } catch (e) {} return null; };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  const list = () => { const l = read(LIST); if (l && l.users) { memList = l; return l; } return memList; };
  const saveList = l => { memList = l; write(LIST, l); };
  const idOf = name => name.trim().toLowerCase();
  const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  const randSalt = () => { const a = new Uint8Array(16); (self.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.floor(Math.random() * 256); }); return hex(a); };
  /* PBKDF2 where the browser allows it, otherwise a simple salted hash so sign-up still works from a file:// page */
  async function hash(pw, salt){
    try {
      if (self.crypto && crypto.subtle) {
        const enc = new TextEncoder(), key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
        return "p1:" + hex(await crypto.subtle.deriveBits({ name:"PBKDF2", hash:"SHA-256", salt:enc.encode(salt), iterations:100000 }, key, 256));
      }
    } catch (e) {}
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57; const str = salt + ":" + pw;
    for (let r = 0; r < 2000; r++) for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return "s1:" + (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
  }
  const checkName = n => { n = n.trim(); return n.length < 3 ? "Pick a username with at least 3 characters." : n.length > 20 ? "Keep the username to 20 characters or fewer." : !/^[A-Za-z0-9_.-]+$/.test(n) ? "Use only letters, numbers, dots, dashes and underscores in the username." : ""; };
  const checkPw = p => p.length < 6 ? "Pick a password with at least 6 characters." : p.length > 100 ? "That password is too long." : "";
  return {
    count: () => Object.keys(list().users).length,
    saveKey: id => SAVE + id,
    /* sign up, and adopt the older single save the first time an account is made on this browser */
    async signUp(name, pw){
      const e = checkName(name) || checkPw(pw); if (e) return { error:e };
      const l = list(), id = idOf(name); if (l.users[id]) return { error:"That username is taken. Try another, or log in." };
      const first = Object.keys(l.users).length === 0, old = first ? Store.peek(Store.GUEST) : null, salt = randSalt();
      l.users[id] = { name:name.trim(), salt, hash:await hash(pw, salt), created:Date.now() };
      const adopted = !!(old && (old.casts || old.unlocked > 1 || Object.keys(old.tracks || {}).length || old.coins));
      if (adopted) write(SAVE + id, old);
      saveList(l); return { id, name:l.users[id].name, adopted };
    },
    async logIn(name, pw){
      const l = list(), id = idOf(name), u = l.users[id];
      if (!u || u.hash !== await hash(pw, u.salt)) return { error:"That username and password do not match." };
      return { id, name:u.name };
    },
    nameOf: id => (list().users[id] || {}).name || id,
    exists: id => !!list().users[id],
    remember(v){ if (!write(SESSION, v)) memSession = v; },
    forget(){ try { localStorage.removeItem(SESSION); } catch (e) {} memSession = null; },
    session(){ return read(SESSION) || memSession; }
  };
})();

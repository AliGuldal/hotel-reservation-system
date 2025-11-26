const odalar = [
    { no: 101, tip: "tek" }, { no: 102, tip: "tek" }, { no: 103, tip: "tek" },
    { no: 201, tip: "cift" }, { no: 202, tip: "cift" }, { no: 203, tip: "cift" },
    { no: 301, tip: "suite" }, { no: 302, tip: "suite" }
];

const kampanyalar = [
    { kod: "YAZ20", indirim: 0.20, gecerlilik: new Date("2026-09-01") },
    { kod: "ILK10", indirim: 0.10, gecerlilik: new Date("2026-12-31") },
    { kod: "SAMBA50", indirim: 0.50, gecerlilik: new Date("2025-10-30") }
];

const fiyatlar = {
    tek: 1000,
    cift: 1500,
    suite: 2500
};

const ekHizmetlerFiyatlari = {
    kahvalti: 150, 
    transfer: 400, 
    miniBar: 100 
}

const ozellikCarpanlari = {
    deniz: 1.10,
    balkon: 1.05,
    sigara: 1.02
};

const haftaSonuZamOrani = 0.20; 
const sezonZamOrani = 0.50; 
const usersKey = "otel_users";
const currentUserKey = "otel_current_user";
const rezervasyonlarKey = "rezervasyonlar";


if (!localStorage.getItem(usersKey)) {
    localStorage.setItem(usersKey, JSON.stringify([
        { username: "admin", password: "admin", adSoyad: "Sistem Yöneticisi", email: "admin@samba.com" },
        { username: "user1", password: "1234", adSoyad: "Ahmet Yılmaz", email: "ahmet@ornek.com" }
    ]));
}

let duzenlenenRezervasyonIndexi = null;
let currentTakvimAy = new Date().getMonth();
let currentTakvimYil = new Date().getFullYear();



const DOM = {
    loginBtn: document.getElementById("loginBtn"),
    logoutBtn: document.getElementById("logoutBtn"),
    registerBtn: document.getElementById("registerBtn"),
    registerForm: document.getElementById("registerForm"),
    
    rezervasyonForm: document.getElementById("rezervasyonForm"),
    girisTarihiInput: document.getElementById("girisTarihi"),
    cikisTarihiInput: document.getElementById("cikisTarihi"),
    odaTipiInput: document.getElementById("odaTipi"),
    odaSecimiInput: document.getElementById("odaSecimi"),
    promosyonKoduInput: document.getElementById("promosyonKodu"),
    adInput: document.getElementById("ad"), 
    emailInput: document.getElementById("email"), 

    anlikFiyatGosterge: document.getElementById("anlikFiyatGosterge"),
    tahminiFiyatSpan: document.getElementById("tahminiFiyat"),
    onayGosterge: document.getElementById("onayGosterge"),
    onayKoduSpan: document.getElementById("onayKodu"),

    ozellikDeniz: document.getElementById("ozellikDeniz"),
    ozellikBalkon: document.getElementById("ozellikBalkon"),
    ozellikSigara: document.getElementById("ozellikSigara"),

    hizmetKahvalti: document.getElementById("hizmetKahvalti"),
    hizmetTransfer: document.getElementById("hizmetTransfer"),
    hizmetMiniBar: document.getElementById("hizmetMiniBar"),

    kartNoInput: document.getElementById('kartNo'),
    sonKullanmaInput: document.getElementById('sonKullanma'),
    cvcInput: document.getElementById('cvc'),

    takvimOdaTipi: document.getElementById("takvimOdaTipi"),
    takvimOdaNo: document.getElementById("takvimOdaNo"),
    takvimDiv: document.getElementById("takvim"),
    takvimOncekiAy: document.getElementById("takvimOncekiAy"),
    takvimSonrakiAy: document.getElementById("takvimSonrakiAy"),

    kullaniciRezervasyonlar: document.getElementById("kullaniciRezervasyonlar"),
    adminRaporPanel: document.getElementById("adminRaporPanel"),
    raporToplamGelir: document.getElementById("raporToplamGelir"), 
    raporRezSayisi: document.getElementById("raporRezSayisi"), 
    raporEnCokOdaTip: document.getElementById("raporEnCokOdaTip"),

    editGirisTarihi: document.getElementById("editGirisTarihi"),
    editCikisTarihi: document.getElementById("editCikisTarihi"),
    editOdaTipi: document.getElementById("editOdaTipi"),
    
};

/**
 * Giriş tarihini sıfırlanmış saatlerle Date nesnesine çevirir.
 * @param {string} dateStr 'YYYY-MM-DD' formatında tarih dizesi.
 * @returns {Date}
 */
function getDateWithoutTime(dateStr) {
    const d = new Date(dateStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function luhnKontrol(kartNo) {
    return true; 
}

function showPopup(title, message) {
    const modalTitle = document.getElementById('popupModalTitle');
    const modalBody = document.getElementById('popupModalBody');
    if(modalTitle && modalBody) {
        modalTitle.textContent = title;
        modalBody.textContent = message;
        if (typeof $ !== 'undefined' && $('#popupModal').modal) {
            $('#popupModal').modal('show');
        } else {
             console.log(`POPUP: ${title} - ${message}`);
        }
    }
}

function showConfirmPopup(message, callback) {
    const modalBody = document.getElementById('confirmModalBody');
    const confirmBtn = document.getElementById('confirmBtn');
    if(modalBody && confirmBtn && typeof $ !== 'undefined' && $('#confirmModal').modal) {
        modalBody.textContent = message;
        $(confirmBtn).off('click');
        $(confirmBtn).on('click', () => {
            callback();
            $('#confirmModal').modal('hide');
        });
        $('#confirmModal').modal('show');
    } else {
        if (confirm(message)) {
            callback();
        }
    }
}

function generateReservationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}


function login() {
    const adInput = document.getElementById("kullaniciAd");
    const sifreInput = document.getElementById("kullaniciSifre");
    if(!adInput || !sifreInput) return;

    const ad = adInput.value;
    const sifre = sifreInput.value;
    const users = JSON.parse(localStorage.getItem(usersKey)) || [];
    const user = users.find(u => u.username === ad && u.password === sifre);
    
    if (user) {
        localStorage.setItem(currentUserKey, JSON.stringify(user));
        updateUIForUser();
        showPopup("Giriş Başarılı!", `Hoş geldiniz, ${user.username}.`);
        adInput.value = '';
        sifreInput.value = '';
    } else {
        showPopup("Giriş Hatası", "Hatalı kullanıcı adı veya şifre!");
    }
}

function logout() {
    localStorage.removeItem(currentUserKey);
    updateUIForUser();
    showPopup("Çıkış Yapıldı", "Başarıyla çıkış yaptınız.");
}

function register(e) {
    e.preventDefault();
    const username = document.getElementById("regUsername")?.value;
    const password = document.getElementById("regPassword")?.value;
    const adSoyad = document.getElementById("regAdSoyad")?.value || username;
    const email = document.getElementById("regEmail")?.value || `${username}@samba.com`;

    if (!username || !password) return showPopup("Hata", "Lütfen tüm kayıt alanlarını doldurun.");

    const users = JSON.parse(localStorage.getItem(usersKey)) || [];
    const userExists = users.some(u => u.username === username);

    if (userExists) {
        showPopup("Kayıt Hatası", "Bu kullanıcı adı zaten mevcut.");
    } else {
        users.push({ username, password, adSoyad, email }); 
        localStorage.setItem(usersKey, JSON.stringify(users));
        showPopup("Başarılı", "Hesabınız oluşturuldu. Şimdi giriş yapabilirsiniz.");
        if (typeof $ !== 'undefined' && $('#registerModal').modal) {
            $('#registerModal').modal('hide');
        }
        document.getElementById("registerForm").reset();
    }
}

function updateUIForUser() {
    const user = JSON.parse(localStorage.getItem(currentUserKey));
    const isUser = !!user;
    const isAdmin = user && user.username === "admin";

    document.getElementById("loginBtn").style.display = isUser ? "none" : "inline-block";
    document.getElementById("registerBtn").style.display = isUser ? "none" : "inline-block";
    document.getElementById("logoutBtn").style.display = isUser ? "inline-block" : "none";
    
    const adInput = document.getElementById("kullaniciAd");
    const sifreInput = document.getElementById("kullaniciSifre");
    if(adInput) adInput.style.display = isUser ? "none" : "inline-block";
    if(sifreInput) sifreInput.style.display = isUser ? "none" : "inline-block";

    if(DOM.rezervasyonForm) DOM.rezervasyonForm.style.display = isUser ? "block" : "none";
    if(DOM.kullaniciRezervasyonlar) DOM.kullaniciRezervasyonlar.style.display = isUser ? "block" : "none";
    if(DOM.adminRaporPanel) DOM.adminRaporPanel.style.display = isAdmin ? "block" : "none";

    if(DOM.anlikFiyatGosterge) DOM.anlikFiyatGosterge.style.display = 'none';
    if(DOM.tahminiFiyatSpan) DOM.tahminiFiyatSpan.textContent = '₺0.00';
    if(DOM.promosyonKoduInput) DOM.promosyonKoduInput.value = '';
    if(DOM.onayGosterge) DOM.onayGosterge.style.display = 'none'; 

    if (isUser) {
        showKullaniciRezervasyonlar(user.username);
        if (isAdmin) {
            gosterAdminRapor(); 
        }
        if (DOM.adInput && user.adSoyad) DOM.adInput.value = user.adSoyad;
        if (DOM.emailInput && user.email) DOM.emailInput.value = user.email;
    } else {
        if (DOM.adInput) DOM.adInput.value = '';
        if (DOM.emailInput) DOM.emailInput.value = '';
    }
    
    guncelleOdaListesi();
    gosterTakvim(); 
}


function kartKontrol(kartNo, sonKullanma, cvc) {
    if (!kartNo || !sonKullanma || !cvc) {
        showPopup("Hata", "Lütfen ödeme bilgilerinizi eksiksiz giriniz.");
        return false;
    }

    if (kartNo.length !== 16 || isNaN(kartNo) || !luhnKontrol(kartNo)) {
        showPopup("Hata", `Kart Numarası hatalı. Lütfen 16 hane giriniz ve geçerli bir numara olduğundan emin olunuz.`);
        DOM.kartNoInput.focus();
        return false;
    }

    if (cvc.length < 3 || cvc.length > 4 || isNaN(cvc)) {
        showPopup("Hata", "CVC/CVV kodu 3 veya 4 haneli olmalıdır.");
        DOM.cvcInput.focus();
        return false;
    }
    
    if (sonKullanma.length !== 5 || sonKullanma.indexOf('/') === -1) {
        showPopup("Hata", "Son kullanma tarihi formatı hatalı (AA/YY).");
        DOM.sonKullanmaInput.focus();
        return false;
    }

    const [ayStr, yilStr] = sonKullanma.split('/');
    const ay = parseInt(ayStr, 10);
    const yil = 2000 + parseInt(yilStr, 10);
    
    if (ay < 1 || ay > 12) {
        showPopup("Hata", "Geçersiz ay değeri (1-12 arasında olmalı).");
        DOM.sonKullanmaInput.focus();
        return false;
    }

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0); 
    
    const sonKullanmaTarihi = new Date(yil, ay, 0); 

    if (sonKullanmaTarihi.getTime() < bugun.getTime()) {
        showPopup("Hata", "Kredi kartının süresi dolmuştur.");
        DOM.sonKullanmaInput.focus();
        return false;
    }
    
    return true;
}

function tarihKesisiyorMu(giris1Str, cikis1Str, giris2Str, cikis2Str) {
    const start1 = getDateWithoutTime(giris1Str).getTime();
    const end1 = getDateWithoutTime(cikis1Str).getTime();
    const start2 = getDateWithoutTime(giris2Str).getTime();
    const end2 = getDateWithoutTime(cikis2Str).getTime();

    return start1 < end2 && end1 > start2;
}

function gunHesapla(giris, cikis) {
    const start = getDateWithoutTime(giris).getTime();
    const end = getDateWithoutTime(cikis).getTime();
    
    if (end <= start) return 0; 
    return (end - start) / (1000 * 60 * 60 * 24);
}

/**
 * Yeni: Sezonluk zam ve Ek Hizmetleri dahil eden gelişmiş fiyat hesaplama
 * @param {object} hizmetler - Seçili ek hizmetler (kahvalti, transfer, miniBar)
 */
function fiyatHesapla(girisStr, cikisStr, odaTipi, haftaSonuOran, ozellikler, hizmetler, indirimOrani = 0) {
    let toplam = 0;
    
    let cur = getDateWithoutTime(girisStr);
    const end = getDateWithoutTime(cikisStr);
    const gunSayisi = gunHesapla(girisStr, cikisStr); 

    while (cur < end) {
        const gun = cur.getDay();
        const ay = cur.getMonth(); 
        let fiyat = fiyatlar[odaTipi];
        
        if (gun === 6 || gun === 0) fiyat *= (1 + haftaSonuOran);
        
        if (ay === 6 || ay === 7) fiyat *= (1 + sezonZamOrani);

        if (ozellikler.deniz) fiyat *= ozellikCarpanlari.deniz;
        if (ozellikler.balkon) fiyat *= ozellikCarpanlari.balkon;
        if (ozellikler.sigara) fiyat *= ozellikCarpanlari.sigara;
        
        toplam += fiyat;

        cur.setDate(cur.getDate() + 1);
    }
    
    let hizmetFiyati = 0;
    
    if (hizmetler.kahvalti) hizmetFiyati += ekHizmetlerFiyatlari.kahvalti * gunSayisi; 
    if (hizmetler.miniBar) hizmetFiyati += ekHizmetlerFiyatlari.miniBar * gunSayisi; 
    
    if (hizmetler.transfer) hizmetFiyati += ekHizmetlerFiyatlari.transfer;

    toplam += hizmetFiyati;

    let sonFiyat = toplam * (1 - indirimOrani);
    return sonFiyat;
}


function rezervasyonYap(e) {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem(currentUserKey));
    if (!user) return showPopup("Hata", "Lütfen giriş yapınız!");

    if(!DOM.kartNoInput || !DOM.sonKullanmaInput || !DOM.cvcInput || !DOM.girisTarihiInput || !DOM.cikisTarihiInput || !DOM.odaTipiInput || !DOM.odaSecimiInput || !DOM.adInput || !DOM.emailInput) return showPopup("Hata", "Eksik form alanı var.");

    const kartNo = DOM.kartNoInput.value;
    const sonKullanma = DOM.sonKullanmaInput.value;
    const cvc = DOM.cvcInput.value;
    
    if (!kartKontrol(kartNo, sonKullanma, cvc)) return;

    const ad = DOM.adInput.value;
    const email = DOM.emailInput.value;
    const giris = DOM.girisTarihiInput.value;
    const cikis = DOM.cikisTarihiInput.value;
    const odaTipi = DOM.odaTipiInput.value;
    const odaNo = parseInt(DOM.odaSecimiInput.value);
    const promosyonKodu = DOM.promosyonKoduInput.value.toUpperCase();

    if (!odaNo) return showPopup("Hata", "Lütfen bir oda seçiniz!");

    const deniz = DOM.ozellikDeniz?.checked || false;
    const balkon = DOM.ozellikBalkon?.checked || false;
    const sigara = DOM.ozellikSigara?.checked || false;
    
    const kahvalti = DOM.hizmetKahvalti?.checked || false;
    const transfer = DOM.hizmetTransfer?.checked || false;
    const miniBar = DOM.hizmetMiniBar?.checked || false;

    const gunSayisi = gunHesapla(giris, cikis);
    if (gunSayisi <= 0) return showPopup("Hata", "Geçersiz tarih aralığı!");

    let indirimOrani = 0;
    let indirimUygulandi = false;
    if (promosyonKodu) {
        const kampanya = kampanyalar.find(k => k.kod === promosyonKodu && new Date() < k.gecerlilik);
        if (kampanya) {
            indirimOrani = kampanya.indirim;
            indirimUygulandi = true;
        } else {
            showPopup("Uyarı", "Geçersiz veya süresi dolmuş promosyon kodu!");
        }
    }

    const ozellikler = { deniz, balkon, sigara };
    const hizmetler = { kahvalti, transfer, miniBar }; 
    const toplamFiyat = fiyatHesapla(giris, cikis, odaTipi, haftaSonuZamOrani, ozellikler, hizmetler, indirimOrani);

    const mevcut = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    const dolu = mevcut.some(r =>
        r.odaNo === odaNo &&
        (tarihKesisiyorMu(giris, cikis, r.giris, r.cikis))
    );
    if (dolu) return showPopup("Hata", "Seçtiğiniz oda bu tarihlerde dolu! Lütfen tekrar kontrol ediniz.");
    
    const onayKodu = generateReservationCode();

    const rezervasyon = {
        username: user.username,
        ad, email, giris, cikis, odaTipi, gunSayisi, toplamFiyat, odaNo, promosyonKodu, onayKodu, 
        ozellikDeniz: deniz, ozellikBalkon: balkon, ozellikSigara: sigara,
        hizmetKahvalti: kahvalti, hizmetTransfer: transfer, hizmetMiniBar: miniBar,
        indirimOrani: indirimOrani
    };

    mevcut.push(rezervasyon);
    localStorage.setItem(rezervasyonlarKey, JSON.stringify(mevcut));

    let successMessage = `Rezervasyon başarıyla oluşturuldu. Toplam fiyat: ₺${toplamFiyat.toFixed(2)}`;
    if (indirimUygulandi) {
        successMessage += ` (%${indirimOrani * 100} İndirim uygulandı)`;
    }
    showPopup("Başarılı!", successMessage);
    
    if(DOM.onayGosterge && DOM.onayKoduSpan) {
        DOM.onayKoduSpan.textContent = onayKodu;
        DOM.onayGosterge.style.display = 'block';
    }
    
    document.getElementById("rezervasyonForm").reset();
    if(DOM.adInput) DOM.adInput.value = user.adSoyad || '';
    if(DOM.emailInput) DOM.emailInput.value = user.email || '';
    
    DOM.kartNoInput.value = '';
    DOM.sonKullanmaInput.value = '';
    DOM.cvcInput.value = '';

    if(DOM.anlikFiyatGosterge) DOM.anlikFiyatGosterge.style.display = 'none';
    showKullaniciRezervasyonlar(user.username);
    gosterAdminRapor();
    guncelleOdaListesi();
    gosterTakvim(); 
}

function duzenle(index) {
    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    const rezervasyon = rezervasyonlar[index];

    if(DOM.editGirisTarihi) DOM.editGirisTarihi.value = rezervasyon.giris;
    if(DOM.editCikisTarihi) DOM.editCikisTarihi.value = rezervasyon.cikis;
    if(DOM.editOdaTipi) DOM.editOdaTipi.value = rezervasyon.odaTipi;
    if(document.getElementById("editOzellikDeniz")) document.getElementById("editOzellikDeniz").checked = rezervasyon.ozellikDeniz;
    if(document.getElementById("editOzellikBalkon")) document.getElementById("editOzellikBalkon").checked = rezervasyon.ozellikBalkon;
    if(document.getElementById("editOzellikSigara")) document.getElementById("editOzellikSigara").checked = rezervasyon.ozellikSigara;
    
    if(document.getElementById("editHizmetKahvalti")) document.getElementById("editHizmetKahvalti").checked = rezervasyon.hizmetKahvalti || false;
    if(document.getElementById("editHizmetTransfer")) document.getElementById("editHizmetTransfer").checked = rezervasyon.hizmetTransfer || false;
    if(document.getElementById("editHizmetMiniBar")) document.getElementById("editHizmetMiniBar").checked = rezervasyon.hizmetMiniBar || false;
    
    duzenlenenRezervasyonIndexi = index;

    guncelleDuzenlemeOdaListesi(rezervasyon.odaNo);
    
    if (typeof $ !== 'undefined' && $('#editModal').modal) {
        $('#editModal').modal('show');
    }
}

function guncelleDuzenlemeOdaListesi(seciliOdaNo) {
    const odaTipi = DOM.editOdaTipi?.value;
    const giris = DOM.editGirisTarihi?.value;
    const cikis = DOM.editCikisTarihi?.value;
    const odaSec = document.getElementById("editOdaSecimi");

    if(!odaSec) return;
    odaSec.innerHTML = '<option value="">Oda Seç</option>';

    if (!odaTipi || !giris || !cikis || gunHesapla(giris, cikis) <= 0) return;

    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];

    const uygunOdalar = odalar.filter(o => {
        if (o.tip !== odaTipi) return false;
        
        const dolu = rezervasyonlar.some((r, i) => {
            if (i === duzenlenenRezervasyonIndexi) return false; 
            if (r.odaNo !== o.no) return false;
            
            return tarihKesisiyorMu(giris, cikis, r.giris, r.cikis);
        });
        return !dolu;
    });

    uygunOdalar.forEach(o => {
        const option = document.createElement("option");
        option.value = o.no;
        option.textContent = `Oda ${o.no}`;
        if (o.no === seciliOdaNo) {
            option.selected = true;
        }
        odaSec.appendChild(option);
    });
}

function duzenlemeYap(e) {
    e.preventDefault();

    const giris = DOM.editGirisTarihi?.value;
    const cikis = DOM.editCikisTarihi?.value;
    const odaTipi = DOM.editOdaTipi?.value;
    const odaNoInput = document.getElementById("editOdaSecimi");
    if(!odaNoInput || !giris || !cikis || !odaTipi) return;
    
    const odaNo = parseInt(odaNoInput.value);
    
    if (!odaNo) return showPopup("Hata", "Lütfen bir oda seçiniz!");

    const deniz = document.getElementById("editOzellikDeniz")?.checked;
    const balkon = document.getElementById("editOzellikBalkon")?.checked;
    const sigara = document.getElementById("editOzellikSigara")?.checked;
    
    const kahvalti = document.getElementById("editHizmetKahvalti")?.checked || false;
    const transfer = document.getElementById("editHizmetTransfer")?.checked || false;
    const miniBar = document.getElementById("editHizmetMiniBar")?.checked || false;

    const gunSayisi = gunHesapla(giris, cikis);
    if (gunSayisi <= 0) return showPopup("Hata", "Geçersiz tarih aralığı!");

    let rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    const eskiRez = rezervasyonlar[duzenlenenRezervasyonIndexi];
    if(!eskiRez) return;
    
    const indirimOrani = eskiRez.indirimOrani || 0; 
    const ozellikler = { deniz, balkon, sigara };
    const hizmetler = { kahvalti, transfer, miniBar }; 
    const toplamFiyat = fiyatHesapla(giris, cikis, odaTipi, haftaSonuZamOrani, ozellikler, hizmetler, indirimOrani); 

    const guncelRezervasyon = {
        ...eskiRez,
        giris, cikis, odaTipi, odaNo, gunSayisi, toplamFiyat,
        ozellikDeniz: deniz, ozellikBalkon: balkon, ozellikSigara: sigara,
        hizmetKahvalti: kahvalti, hizmetTransfer: transfer, hizmetMiniBar: miniBar, 
        indirimOrani: indirimOrani 
    };

    rezervasyonlar[duzenlenenRezervasyonIndexi] = guncelRezervasyon;
    localStorage.setItem(rezervasyonlarKey, JSON.stringify(rezervasyonlar));

    showPopup("Güncelleme Başarılı!", "Rezervasyonunuz başarıyla güncellendi.");
    if (typeof $ !== 'undefined' && $('#editModal').modal) {
        $('#editModal').modal('hide');
    }
    
    const user = JSON.parse(localStorage.getItem(currentUserKey));
    if(user) showKullaniciRezervasyonlar(user.username);
    gosterAdminRapor();
    guncelleOdaListesi();
    gosterTakvim(); 
}

function iptalEt(index) {
    const user = JSON.parse(localStorage.getItem(currentUserKey));
    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    const silinecek = rezervasyonlar[index];

    if (!user || silinecek.username !== user.username) {
        showPopup("Hata", "Bu rezervasyonu iptal etme yetkiniz yok!");
        return;
    }

    showConfirmPopup("Bu rezervasyonu iptal etmek istediğinizden emin misiniz? Ödeme iadesi yapılacaktır.", () => {
        rezervasyonlar.splice(index, 1);
        localStorage.setItem(rezervasyonlarKey, JSON.stringify(rezervasyonlar));
        showPopup("İptal Edildi", "Rezervasyonunuz başarıyla iptal edildi.");
        showKullaniciRezervasyonlar(user.username);
        gosterAdminRapor();
        guncelleOdaListesi();
        gosterTakvim(); 
    });
}

function adminIptalEt(index) {
    showConfirmPopup("Bu rezervasyonu kalıcı olarak iptal etmek istediğinizden emin misiniz?", () => {
        let rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
        rezervasyonlar.splice(index, 1);
        localStorage.setItem(rezervasyonlarKey, JSON.stringify(rezervasyonlar));
        showPopup("İptal Edildi", "Rezervasyon başarıyla iptal edildi.");
        gosterAdminRapor();
        guncelleOdaListesi();
        gosterTakvim(); 
    });
}


function setMinimumDates() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const minDate = `${yyyy}-${mm}-${dd}`;

    if(DOM.girisTarihiInput) DOM.girisTarihiInput.setAttribute('min', minDate);
    if(DOM.editGirisTarihi) DOM.editGirisTarihi.setAttribute('min', minDate);

    if(DOM.girisTarihiInput) DOM.girisTarihiInput.addEventListener('change', () => {
        const start = new Date(DOM.girisTarihiInput.value);
        start.setDate(start.getDate() + 1);
        
        const nextDay = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
        if(DOM.cikisTarihiInput) DOM.cikisTarihiInput.setAttribute('min', nextDay);
        
        if (DOM.cikisTarihiInput && DOM.cikisTarihiInput.value && new Date(DOM.cikisTarihiInput.value) <= new Date(DOM.girisTarihiInput.value)) {
             DOM.cikisTarihiInput.value = nextDay;
        }
        gosterAnlikFiyat();
    });
    
    if(DOM.cikisTarihiInput) DOM.cikisTarihiInput.addEventListener('change', gosterAnlikFiyat);
}


function gosterAnlikFiyat() {
    if(!DOM.girisTarihiInput || !DOM.cikisTarihiInput || !DOM.odaTipiInput) return;
    
    const giris = DOM.girisTarihiInput.value;
    const cikis = DOM.cikisTarihiInput.value;
    const odaTipi = DOM.odaTipiInput.value;
    const promosyonKodu = DOM.promosyonKoduInput?.value.toUpperCase();
    
    if (!DOM.anlikFiyatGosterge || !DOM.tahminiFiyatSpan || !giris || !cikis || gunHesapla(giris, cikis) <= 0 || !odaTipi) {
        if(DOM.anlikFiyatGosterge) DOM.anlikFiyatGosterge.style.display = 'none';
        return;
    }

    const deniz = DOM.ozellikDeniz?.checked || false;
    const balkon = DOM.ozellikBalkon?.checked || false;
    const sigara = DOM.ozellikSigara?.checked || false;
    const ozellikler = { deniz, balkon, sigara };
    
    const kahvalti = DOM.hizmetKahvalti?.checked || false;
    const transfer = DOM.hizmetTransfer?.checked || false;
    const miniBar = DOM.hizmetMiniBar?.checked || false;
    const hizmetler = { kahvalti, transfer, miniBar };

    let indirimOrani = 0;
    let indirimUygulandi = false;
    if (promosyonKodu) {
        const kampanya = kampanyalar.find(k => k.kod === promosyonKodu && new Date() < k.gecerlilik);
        if (kampanya) {
            indirimOrani = kampanya.indirim;
            indirimUygulandi = true;
        }
    }

    const toplamFiyat = fiyatHesapla(giris, cikis, odaTipi, haftaSonuZamOrani, ozellikler, hizmetler, indirimOrani);

    DOM.tahminiFiyatSpan.textContent = `₺${toplamFiyat.toFixed(2)}`;
    
    if (indirimUygulandi) {
        DOM.anlikFiyatGosterge.className = 'alert mt-3 alert-success';
        DOM.tahminiFiyatSpan.innerHTML = `₺${toplamFiyat.toFixed(2)} <small class="badge badge-success">(${promosyonKodu} İndirimi: %${indirimOrani*100})</small>`;
    } else {
        DOM.anlikFiyatGosterge.className = 'alert mt-3 alert-info';
        DOM.tahminiFiyatSpan.textContent = `₺${toplamFiyat.toFixed(2)}`;
    }

    DOM.anlikFiyatGosterge.style.display = 'block';
}

function guncelleOdaListesi() {
    gosterAnlikFiyat(); 
    
    if(!DOM.odaTipiInput || !DOM.girisTarihiInput || !DOM.cikisTarihiInput || !DOM.odaSecimiInput) return;
    
    const odaTipi = DOM.odaTipiInput.value;
    const giris = DOM.girisTarihiInput.value;
    const cikis = DOM.cikisTarihiInput.value;
    const odaSec = DOM.odaSecimiInput;
    odaSec.innerHTML = '<option value="">Oda Seç</option>';

    if (!odaTipi || !giris || !cikis || gunHesapla(giris, cikis) <= 0) return;

    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    const uygunOdalar = odalar.filter(o => {
        if (o.tip !== odaTipi) return false;
        const dolu = rezervasyonlar.some(r => {
            if (r.odaNo !== o.no) return false;
            return tarihKesisiyorMu(giris, cikis, r.giris, r.cikis);
        });
        return !dolu;
    });

    uygunOdalar.forEach(o => {
        const option = document.createElement("option");
        option.value = o.no;
        option.textContent = `Oda ${o.no}`;
        odaSec.appendChild(option);
    });
}

function showKullaniciRezervasyonlar(username) {
    const list = document.getElementById("kullaniciRezList");
    if(!list) return;

    list.innerHTML = "";
    const tum = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    tum.forEach((rez, i) => {
        if (rez.username === username) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            const fiyat = typeof rez.toplamFiyat === 'number' ? rez.toplamFiyat : 0;
            
            let detay = `${rez.giris} - ${rez.cikis} | <strong>Oda: ${rez.odaNo}</strong> (${rez.odaTipi})`;
            if(rez.onayKodu) {
                detay += ` | <span class="text-secondary small">Kod: ${rez.onayKodu}</span>`;
            }
            if(rez.hizmetKahvalti || rez.hizmetTransfer || rez.hizmetMiniBar) {
                 detay += ` | <span class="text-success small">Ek Hizmetler</span>`;
            }
            
            li.innerHTML = `
                <span>
                    ${detay} | 
                    <span class="text-primary font-weight-bold">₺${fiyat.toFixed(2)}</span>
                </span>
                <div>
                    <button class="btn btn-sm btn-info" onclick="duzenle(${i})">Düzenle</button>
                    <button class="btn btn-sm btn-danger ml-2" onclick="iptalEt(${i})">İptal</button>
                </div>
            `;
            list.appendChild(li);
        }
    });
}

function renderAdminTablosu(rezervasyonlar) {
    const tabloBodyElement = document.getElementById("adminRezervasyonTabloBody");
    if (!tabloBodyElement) return; 
    
    tabloBodyElement.innerHTML = "";
    
    rezervasyonlar.forEach((rez, index) => {
        const fiyat = typeof rez.toplamFiyat === 'number' ? rez.toplamFiyat : 0;
        const ekHizmetler = [];
        if(rez.hizmetKahvalti) ekHizmetler.push('K');
        if(rez.hizmetTransfer) ekHizmetler.push('T');
        if(rez.hizmetMiniBar) ekHizmetler.push('M');
        const hizmetStr = ekHizmetler.length > 0 ? `(${ekHizmetler.join(',')})` : '';

        const row = tabloBodyElement.insertRow();
        row.innerHTML = `
            <td>${rez.ad || rez.username}</td>
            <td>${rez.giris}</td>
            <td>${rez.cikis}</td>
            <td>${rez.odaNo} (${rez.odaTipi})</td>
            <td>₺${fiyat.toFixed(2)} ${hizmetStr}</td>
            <td>${rez.onayKodu || 'Yok'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="adminIptalEt(${index})">İptal</button>
            </td>
        `;
    });
}

function gosterAdminRapor() {
    const raporDiv = DOM.adminRaporPanel;
    if (!raporDiv) return; 

    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];
    
    let toplamGelir = 0;
    const odaTipSayilari = {};

    rezervasyonlar.forEach(rez => {
        const fiyat = typeof rez.toplamFiyat === 'number' ? rez.toplamFiyat : 0;
        toplamGelir += fiyat;
        odaTipSayilari[rez.odaTipi] = (odaTipSayilari[rez.odaTipi] || 0) + 1;
    });


    if(DOM.raporToplamGelir) DOM.raporToplamGelir.textContent = `₺${toplamGelir.toFixed(2)}`;
    if(DOM.raporRezSayisi) DOM.raporRezSayisi.textContent = rezervasyonlar.length;

    let enCokOdaTip = "Yok";
    let maxSayi = 0;
    for (const tip in odaTipSayilari) {
        if (odaTipSayilari[tip] > maxSayi) {
            maxSayi = odaTipSayilari[tip];
            enCokOdaTip = tip.charAt(0).toUpperCase() + tip.slice(1);
        }
    }
    if(DOM.raporEnCokOdaTip) DOM.raporEnCokOdaTip.textContent = enCokOdaTip;
    
    renderAdminTablosu(rezervasyonlar); 
}


function guncelleTakvimOdalari() {
    if(!DOM.takvimOdaTipi || !DOM.takvimOdaNo) return;

    const odaTipi = DOM.takvimOdaTipi.value;
    DOM.takvimOdaNo.innerHTML = '<option value="">Tüm Odalar</option>'; 

    if (odaTipi) {
        const uygunOdalar = odalar.filter(o => o.tip === odaTipi);
        uygunOdalar.forEach(o => {
            const option = document.createElement("option");
            option.value = o.no;
            option.textContent = `Oda ${o.no}`;
            DOM.takvimOdaNo.appendChild(option);
        });
    }
    gosterTakvim();
}

function takvimAyDegistir(yon) {
    if (yon === 'next') {
        currentTakvimAy++;
        if (currentTakvimAy > 11) {
            currentTakvimAy = 0;
            currentTakvimYil++;
        }
    } else if (yon === 'prev') {
        currentTakvimAy--;
        if (currentTakvimAy < 0) {
            currentTakvimAy = 11;
            currentTakvimYil--;
        }
    }
    gosterTakvim();
}

function gosterTakvim() {
    if(!DOM.takvimDiv || !DOM.takvimOdaTipi || !DOM.takvimOdaNo) return;

    DOM.takvimDiv.innerHTML = "";
    const odaNo = parseInt(DOM.takvimOdaNo.value);
    const odaTipi = DOM.takvimOdaTipi.value;
    
    if (!odaTipi) {
        DOM.takvimDiv.innerHTML = "<p class='text-center text-muted'>Lütfen bir oda tipi seçiniz.</p>";
        return;
    }
    
    const ayinAdi = new Date(currentTakvimYil, currentTakvimAy).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    
    const navDiv = document.createElement('div');
    navDiv.className = 'd-flex justify-content-between align-items-center mb-3 takvim-nav';
    navDiv.innerHTML = `
        <button class="btn btn-sm btn-outline-primary" onclick="takvimAyDegistir('prev')">← Önceki Ay</button>
        <span class="h5 m-0 text-center">${odaNo ? `Oda ${odaNo} Müsaitlik` : `${odaTipi.toUpperCase()} Tipi Odalar`} (${ayinAdi})</span>
        <button class="btn btn-sm btn-outline-primary" onclick="takvimAyDegistir('next')">Sonraki Ay →</button>
    `;
    DOM.takvimDiv.appendChild(navDiv);
    
    const ayinIlkGunu = new Date(currentTakvimYil, currentTakvimAy, 1);
    const ayinSonGunu = new Date(currentTakvimYil, currentTakvimAy + 1, 0); 
    const rezervasyonlar = JSON.parse(localStorage.getItem(rezervasyonlarKey)) || [];

    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'takvim-container-yeni';

    const gosterilenHaftaGunleri = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    gosterilenHaftaGunleri.forEach(gun => {
        const gunDiv = document.createElement("div");
        gunDiv.className = "takvim-gun-header";
        gunDiv.textContent = gun;
        calendarContainer.appendChild(gunDiv);
    });

    let ilkGunHaftaGunu = ayinIlkGunu.getDay() === 0 ? 6 : ayinIlkGunu.getDay() - 1; 
    for (let i = 0; i < ilkGunHaftaGunu; i++) {
        calendarContainer.appendChild(document.createElement("div")); 
    }

    for (let tarih = new Date(ayinIlkGunu); tarih <= ayinSonGunu; tarih.setDate(tarih.getDate() + 1)) {
        const tarihStr = tarih.toISOString().split('T')[0];
        const gunDiv = document.createElement("div");
        gunDiv.className = "takvim-gun-hucre";
        gunDiv.textContent = tarih.getDate();
        
        let doluSayisi = 0;
        let toplamOdaSayisi = 0;
        let odaListesi = [];

        if (odaNo) { 
            odaListesi.push(odalar.find(o => o.no === odaNo));
        } else { 
            odaListesi = odalar.filter(o => o.tip === odaTipi);
        }

        toplamOdaSayisi = odaListesi.length;

        odaListesi.forEach(oda => {
            const dolu = rezervasyonlar.some(r => {
                return r.odaNo === oda.no && tarihKesisiyorMu(tarihStr, tarihStr, r.giris, r.cikis);
            });
            if (dolu) {
                doluSayisi++;
            }
        });
        
        const bosSayisi = toplamOdaSayisi - doluSayisi;
        
        if (toplamOdaSayisi > 0) {
            if (bosSayisi === 0) {
                gunDiv.classList.add("dolu-tam"); 
                gunDiv.setAttribute('title', `TÜM ODALAR DOLU`);
            } else if (doluSayisi > 0) {
                gunDiv.classList.add("dolu-kismen"); 
                gunDiv.setAttribute('title', `${bosSayisi} oda boş, ${doluSayisi} oda dolu.`);
            } else {
                gunDiv.classList.add("bos-tam"); 
                gunDiv.setAttribute('title', `TÜM ODALAR BOŞ`);
            }
            
            if (!odaNo) {
                const dolulukBilgisi = document.createElement("small");
                dolulukBilgisi.className = "d-block mt-1";
                dolulukBilgisi.textContent = `${bosSayisi}/${toplamOdaSayisi}`;
                gunDiv.appendChild(dolulukBilgisi);
            }
        }
        
        calendarContainer.appendChild(gunDiv);
    }
    
    DOM.takvimDiv.appendChild(calendarContainer);
}



document.addEventListener("DOMContentLoaded", () => {
    setMinimumDates(); 
    updateUIForUser();
    guncelleTakvimOdalari(); 

    document.getElementById("editForm")?.addEventListener("change", () => {
        guncelleDuzenlemeOdaListesi(null);
    });
});

if(DOM.loginBtn) DOM.loginBtn.onclick = login;
if(DOM.logoutBtn) DOM.logoutBtn.onclick = logout;
if(DOM.registerBtn) DOM.registerBtn.onclick = () => {
    document.getElementById("registerForm")?.reset();
    if (typeof $ !== 'undefined' && $('#registerModal').modal) {
        $('#registerModal').modal('show');
    }
};
if(DOM.registerForm) DOM.registerForm.onsubmit = register;

if(DOM.rezervasyonForm) DOM.rezervasyonForm.onsubmit = rezervasyonYap; 
if(DOM.odaTipiInput) DOM.odaTipiInput.addEventListener("change", guncelleOdaListesi);
if(DOM.girisTarihiInput) DOM.girisTarihiInput.addEventListener("change", guncelleOdaListesi);
if(DOM.cikisTarihiInput) DOM.cikisTarihiInput.addEventListener("change", guncelleOdaListesi);

if(DOM.odaTipiInput) DOM.odaTipiInput.addEventListener("change", gosterAnlikFiyat);
if(DOM.ozellikDeniz) DOM.ozellikDeniz.addEventListener("change", gosterAnlikFiyat);
if(DOM.ozellikBalkon) DOM.ozellikBalkon.addEventListener("change", gosterAnlikFiyat);
if(DOM.ozellikSigara) DOM.ozellikSigara.addEventListener("change", gosterAnlikFiyat);
if(DOM.promosyonKoduInput) DOM.promosyonKoduInput.addEventListener("input", gosterAnlikFiyat);

if(DOM.hizmetKahvalti) DOM.hizmetKahvalti.addEventListener("change", gosterAnlikFiyat);
if(DOM.hizmetTransfer) DOM.hizmetTransfer.addEventListener("change", gosterAnlikFiyat);
if(DOM.hizmetMiniBar) DOM.hizmetMiniBar.addEventListener("change", gosterAnlikFiyat);


if(document.getElementById("editForm")) document.getElementById("editForm").onsubmit = duzenlemeYap;
if(DOM.editGirisTarihi) DOM.editGirisTarihi.addEventListener("change", () => guncelleDuzenlemeOdaListesi(null));
if(DOM.editCikisTarihi) DOM.editCikisTarihi.addEventListener("change", () => guncelleDuzenlemeOdaListesi(null));
if(DOM.editOdaTipi) DOM.editOdaTipi.addEventListener("change", () => guncelleDuzenlemeOdaListesi(null));

if(DOM.kartNoInput) DOM.kartNoInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '').substring(0, 16); 
    e.target.value = value;
});

if(DOM.sonKullanmaInput) DOM.sonKullanmaInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) value = value.substring(0, 4);
    if (value.length >= 2) value = value.substring(0, 2) + '/' + value.substring(2);
    e.target.value = value;
});

if(DOM.takvimOdaTipi) DOM.takvimOdaTipi.addEventListener("change", guncelleTakvimOdalari);
if(DOM.takvimOdaNo) DOM.takvimOdaNo.addEventListener("change", gosterTakvim);

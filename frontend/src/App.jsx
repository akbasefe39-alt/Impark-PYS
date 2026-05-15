import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from './api.js';

import Input from './components/Input.jsx';
import Select from './components/Select.jsx';
import Button from './components/Button.jsx';
import EmptyState from './components/EmptyState.jsx';
import MenuDrawer from './components/MenuDrawer.jsx';
import Popups from './components/Popups.jsx';
import ChatDock from './components/ChatDock.jsx';
import MainHeader from './components/MainHeader.jsx';
import Drawer from './components/Drawer.jsx';
import EditModal from './components/EditModal.jsx';
import { Users, CalendarClock, Building, HandCoins, AlertCircle, Trash2, FolderOpen, ClipboardList, Activity, Settings, ScrollText, BarChart as BarChartIcon, PieChart as PieChartIcon, Shield, Lock, Mails, Send } from 'lucide-react';
import { getDict, downloadCSV, generatePayslipPDF, generateLeaveRequestPDF, generateEmployeeCardPDF } from './utils.js';
import GenericCustomizer from './components/GenericCustomizer.jsx';
import ReportsDashboard from './components/ReportsDashboard.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line } from 'recharts';
import { StatWidget, DepartmentPieWidget, ExpenseBarWidget } from './components/DashboardWidgets.jsx';

import { IMPARK_LOGO } from './assets/logo.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
    setCaptchaPassed(false);
  };

  useEffect(() => {
    if (failedAttempts === 3) generateCaptcha();
  }, [failedAttempts]);
  const [lang, setLang] = useState('TR');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState('ai');
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState('izin');
  const [unreadAnnouncement, setUnreadAnnouncement] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [personeller, setPersoneller] = useState([]);
  const [departmanlar, setDepartmanlar] = useState([]);
  const [izinler, setIzinler] = useState([]);
  const [maaslar, setMaaslar] = useState([]);
  const [mesailer, setMesailer] = useState([]);
  const [duyurular, setDuyurular] = useState([]);
  const [zimmetler, setZimmetler] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [docs, setDocs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [performances, setPerformances] = useState([]);
  const [recycleBin, setRecycleBin] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const tr = getDict(lang);
  const [aiChat, setAiChat] = useState([{ isAi: true, text: tr("System analysis module active. You can query data naturally.", "Sistem analiz modülü aktif. Verileri doğal dille sorgulayabilirsiniz.") }]);
  const [chatInput, setChatInput] = useState('');
  const [currentTab, setCurrentTab] = useState('home');
  const [dashboardLayout, setDashboardLayout] = useState(['stat_staff', 'stat_leaves', 'stat_deps', 'stat_budget', 'chart_deps', 'chart_expenses']);
  const [homeLayout, setHomeLayout] = useState(['welcome', 'month_stats', 'announcements', 'notes']);
  const [personalNotes, setPersonalNotes] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showHomeCustomizer, setShowHomeCustomizer] = useState(false);

  const [stats, setStats] = useState({ totalUsers: 0, pendingIzins: 0, totalDeps: 0, totalBudget: 0, chartData: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [depFilter, setDepFilter] = useState('All');
  const [leaveView, setLeaveView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedAiUser, setSelectedAiUser] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [hoveredLeave, setHoveredLeave] = useState(null);
  const [selectedTrashItems, setSelectedTrashItems] = useState([]);
  const [securityReport, setSecurityReport] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isManager = ['yonetici', 'admin'].includes(currentUser?.role);
  const isYonetici = currentUser?.role === 'yonetici';
  const myDepId = currentUser?.departmanId;
  const me = (personeller || []).find(p => p.id === currentUser?.id);

  // Şifre Sıfırlama State'leri
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const isResetMode = !!resetToken;
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');
  const [mustPass, setMustPass] = useState('');
  const [mustConf, setMustConf] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);


  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    if (theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const chatEndRef = useRef(null);

  const [pForm, setPForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'personel', departmanId: '', iseGirisTarihi: '', normalCalismaSaati: 8, saatlikUcret: 0, gunlukUcret: 0, unvan: '', canViewDashboard: true });
  const [dForm, setDForm] = useState({ ad: '' });
  const [mForm, setMForm] = useState({ personelId: '', brutMaas: '', temelMaas: '', prim: '', odemeTarihi: '', sgkYuzdesi: 14, vergiYuzdesi: 20 });
  const [iForm, setIForm] = useState({ personelId: '', baslangicTarihi: '', bitisTarihi: '', neden: '', izinTuru: 'Yıllık İzin', devreYil: String(new Date().getFullYear()), gunSayisi: 1, isBaslamaTarihi: '', isYeriSicilNo: '24614010112665580062197000' });
  const [mesaiForm, setMesaiForm] = useState({ personelId: '', tarih: '', girisSaati: '' });
  const [duyuruForm, setDuyuruForm] = useState({ baslik: '', icerik: '' });
  const [zForm, setZForm] = useState({ personelId: '', esyaAdi: '', seriNo: '', verilisTarihi: '' });
  const [taskForm, setTaskForm] = useState({ personelId: '', baslik: '', aciklama: '', sonTarih: '' });
  const [expForm, setExpForm] = useState({ personelId: '', baslik: '', miktar: '', tarih: '' });
  const [docForm, setDocForm] = useState({ personelId: '', dosyaAdi: '', dosyaTuru: 'Sözleşme', dosyaIcerik: null });
  const [selectedMailUsers, setSelectedMailUsers] = useState([]);
  const [mailSubject, setMailSubject] = useState('');
  const [mailContent, setMailContent] = useState('');

  const t = {
    TR: { dash: 'Özet Panel', staff: 'Personel Ağı', tasks: 'Görev Akışı', archived: 'Duyurular', assets: 'Demirbaşlar', logout: 'Çıkış', add: 'Yeni İşlem', empty: 'Kayıt Bulunamadı', perf: 'AI Analiz', trash: 'Çöp Kutusu', roles: 'Yetki & Roller', pdks: 'Mesai / PDKS', finance: 'Bordro & Maaş', deps: 'Departmanlar', leaves: 'İzin Talepleri', exp: 'Harcamalar', docs: 'Belge Arşivi', logs: 'Sistem Kayıtları', apps: 'Uygulamalar', onboarding: 'İşe Giriş/Çıkış', raporlar: 'Raporlar & Analiz', security: 'Güvenlik Merkezi', mail: 'E-Posta Merkezi' },
    EN: { dash: 'Dashboard', staff: 'Staff Network', tasks: 'Tasks', archived: 'Announcements', assets: 'Assets', logout: 'Logout', add: 'New Action', empty: 'No Data Found', perf: 'AI Analysis', trash: 'Recycle Bin', roles: 'Roles & Auth', pdks: 'Attendance', finance: 'Payroll', deps: 'Departments', leaves: 'Leave Requests', exp: 'Expenses', docs: 'Documents', logs: 'System Logs', apps: 'Applications', onboarding: 'Onboarding', raporlar: 'Reports & Analytics', security: 'Security Center', mail: 'Email Center' }
  }[lang];

  useEffect(() => {
    // 🔗 URL'de Reset Token var mı kontrol et
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('resetToken');
    if (tokenParam) {
      setResetToken(tokenParam);
      // URL'yi temizle (token'ın browser geçmişinde kalmaması için isteğe bağlı)
      // window.history.replaceState({}, document.title, "/");
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        // 🔐 KODLAMA DÜZELTMESİ: atob sadece ASCII desteklediği için Türkçe karakterleri (Ö, ü vb.) bozar.
        // Bu yüzden decodeURIComponent(escape(atob(...))) kullanarak UTF-8 çözüyoruz.
        const base64 = token.split('.')[1];
        const payload = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        setCurrentUser({ 
          id: payload.sub, 
          role: payload.role, 
          name: payload.name, 
          departmanId: payload.departmanId,
          canManagePersonnel: payload.canManagePersonnel,
          canManageFinance: payload.canManageFinance,
          canApproveLeaves: payload.canApproveLeaves,
          canManageInventory: payload.canManageInventory,
          canViewLogs: payload.canViewLogs,
          mustChangePassword: payload.mustChangePassword
        });
        setIsLoggedIn(true); 
        fetchData(payload.sub, payload.role);

        // 🚀 ANLIK BİLDİRİM & VERİ TAZELEME (30 Saniyede Bir)
        const interval = setInterval(() => fetchData(payload.sub, payload.role), 30000);
        return () => clearInterval(interval);
      } catch (e) {
        console.error(e);
        localStorage.removeItem('token');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🚀 WEBSOCKET (SOCKET.IO) BAĞLANTISI
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
       auth: { token: localStorage.getItem('token') }
    });

    socket.on('connect', () => {
       console.log('✅ WebSocket Connected (Room:', `user_${currentUser.id})`);
    });

    socket.on('new_notification', (notifData) => {
       // Bildirim state'ini anında güncelle
       setNotifications(prev => [notifData, ...prev]);
       
       // Ekrana pop-up at
       showNotification(
          typeof notifData.message === 'string' ? notifData.message : tr("New notification received!", "Yeni bir sistem bildirimi aldınız!"), 
          "success"
       );
    });

    return () => {
       socket.disconnect();
    };
  }, [currentUser?.id]);

  useEffect(() => {
    const tabToDrawer = {
      'personel': 'personel',
      'departman': 'departman',
      'izin': 'izin',
      'mesai': 'mesai',
      'duyuru_arşiv': 'duyuru',
      'zimmet': 'zimmet',
      'gorevler': 'gorev',
      'harcamalar': 'harcama',
      'maas': 'maas',
      'belgeler': 'belge'
    };
    if (tabToDrawer[currentTab]) setDrawerType(tabToDrawer[currentTab]);

    // Auto-fill personelId for non-managers safely
    if (!isManager && currentUser?.id) {
      const uid = currentUser.id;
      setIForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
      setMesaiForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
      setExpForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
      setZForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
      setDocForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
      setTaskForm(prev => prev.personelId === uid ? prev : { ...prev, personelId: uid });
    }
  }, [currentTab, isManager, currentUser]);
  
  // 🛡️ GÜVENLİK: 15 Dakika İşlem Yapılmazsa Otomatik Çıkış (Inactivity Logout)
  useEffect(() => {
    if (!isLoggedIn) return;

    let timeoutId;
    let lastActivity = Date.now();
    const INACTIVITY_TIME = 15 * 60 * 1000; // 15 dakika

    const resetTimer = (e) => {
      // 🛡️ PERFORMANS: Mousemove olayını 30 saniyede bir işle (throttle)
      if (e?.type === 'mousemove' && Date.now() - lastActivity < 30000) return;
      lastActivity = Date.now();

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_TIME);
    };

    const handleLogout = () => {
      localStorage.removeItem('token');
      window.location.reload();
    };

    // Dinlenecek olaylar (Klavye, mouse, kaydırma vb.)
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    // İlk timer'ı başlat
    resetTimer();

    // Olayları ekle
    events.forEach(event => document.addEventListener(event, resetTimer));

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

  // 🛡️ GÜVENLİK: Diğer sekmelerde çıkış yapıldığında bu sekmeyi de kapat (Cross-tab Sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && !e.newValue) {
        window.location.reload();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 🛡️ GÜVENLİK SENKRONİZASYONU: Kişisel ayarları Token yerine API'den (me) al
  useEffect(() => {
    if (me) {
      if (me.dashboardLayout) {
        try { setDashboardLayout(JSON.parse(me.dashboardLayout)); } catch(e) { console.error("Layout parse error", e); }
      }
      if (me.homeLayout) {
        try { setHomeLayout(JSON.parse(me.homeLayout)); } catch(e) { console.error("Home layout parse error", e); }
      }
      if (me.personalNotes !== undefined) {
        setPersonalNotes(me.personalNotes || '');
      }
    }
  }, [me?.id, !!me]);

  useEffect(() => {
    if (isLoggedIn && me && !me.canViewDashboard && currentTab === 'dashboard') {
      setCurrentTab('home'); // Dashboard yetkisi yoksa Ana Sayfa'ya yönlendir
    }
  }, [isLoggedIn, me, currentTab]);

  const showNotification = (message, type = 'success') => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000); };

  async function saveDashboardLayout() {
    try {
      await api.post(`/users/update-dashboard-layout/${currentUser.id}`, { layout: JSON.stringify(dashboardLayout) });
      showNotification(tr("Dashboard Layout Saved", "Panel Görünümü Kaydedildi"));
      setShowCustomizer(false);
    } catch (e) {
      showNotification(tr("Failed to save layout", "Görünüm kaydedilemedi"), "error");
    }
  }

  async function saveHomeLayout() {
    try {
      await api.post(`/users/update-home-layout/${currentUser.id}`, { layout: JSON.stringify(homeLayout) });
      showNotification(tr("Home Layout Saved", "Ana Sayfa Görünümü Kaydedildi"));
      setShowHomeCustomizer(false);
    } catch (e) {
      showNotification(tr("Failed to save layout", "Görünüm kaydedilemedi"), "error");
    }
  }

  async function savePersonalNotes() {
    try {
      await api.post(`/users/update-personal-notes/${currentUser.id}`, { notes: personalNotes });
      showNotification(tr("Notes Saved", "Notlarınız Kaydedildi"));
    } catch (e) {
      showNotification(tr("Failed to save notes", "Notlar kaydedilemedi"), "error");
    }
  }

  const fetchData = async (userId, userRole = null) => {
    // 🛡️ KURŞUN GEÇİRMEZ VERİ YÜKLEME: Bir endpoint hata verse de diğeri devam eder
    const safeGet = async (url, defaultValue = []) => {
      try {
        const res = await api.get(url);
        return res.data;
      } catch (err) {
        console.warn(`Fetch issue for ${url}:`, err.message);
        return defaultValue;
      }
    };

    try {
      const currentRole = userRole || currentUser?.role;
      const isFullAdmin = currentRole === 'admin';
      const actsAsManager = ['yonetici', 'admin'].includes(currentRole);

      // Tüm verileri asenkron ve güvenli bir şekilde başlatalım
      const [
        pData, dData, iData, sData, mData, msData, dyData, zData,
        tData, eData, lData, docData, nData, perfData, rbData, clData
      ] = await Promise.all([
        safeGet('/users'),
        safeGet('/users/departmanlar-liste'),
        safeGet('/users/izinler'),
        actsAsManager ? safeGet('/users/stats', { totalUsers: 0, pendingIzins: 0, totalDeps: 0, totalBudget: 0, chartData: [] }) : Promise.resolve({ totalUsers: 0, pendingIzins: 0, totalDeps: 0, totalBudget: 0, chartData: [] }),
        safeGet('/users/maaslar'),
        safeGet('/users/mesailer'),
        safeGet('/users/duyurular'),
        safeGet('/users/zimmetler'),
        safeGet('/users/tasks'),
        safeGet('/users/expenses'),
        actsAsManager ? safeGet('/users/logs') : Promise.resolve([]),
        safeGet('/users/documents'),
        safeGet(`/users/notifications/${userId}`),
        safeGet('/users/performance'), // Performans verilerini herkes görsün (Şeffaflık)
        isFullAdmin ? safeGet('/users/recycle-bin') : Promise.resolve([]),
        safeGet('/users/checklists')
      ]);

      // 📊 DASHBOARD RESILIENCE: API'den gelen stats verisi bozuksa/boşsa eldeki listelerle manuel hesapla
      const fallbackStats = {
        totalUsers: pData?.length || 0,
        totalDeps: dData?.length || 0,
        pendingIzins: iData?.filter(i => i.durum === 'Beklemede' || i.durum === 'Yönetici Onayladı').length || 0,
        totalBudget: mData?.reduce((s, m) => s + (Number(m.temelMaas) || 0) + (Number(m.prim) || 0), 0) || 0,
        chartData: dData?.map(d => ({ name: d.ad, value: pData?.filter(p => p.departman?.id === d.id).length || 0 })) || []
      };

      setPersoneller(pData); 
      setDepartmanlar(dData); 
      setIzinler(iData); 
      setStats((sData?.totalUsers > 0) ? sData : fallbackStats); // API verisi yoksa fallback kullan
      setMaaslar(mData);
      setMesailer(msData); 
      setDuyurular(dyData); 
      setZimmetler(zData); 
      setTasks(tData); 
      setExpenses(eData);
      setLogs(lData); 
      setDocs(docData); 
      setNotifications(nData); 
      setPerformances(perfData); 
      setRecycleBin(rbData);
      setChecklists(clData);

      const unread = dyData.find(an => !an.okuyanlar?.some(u => parseInt(u.id) === parseInt(userId)));
      setUnreadAnnouncement(unread || null);
    } catch (e) {
      console.error("Critical Fetch Error:", e);
    }
  };

    const handleAction = async (method, url, data = {}, msg = '') => {
    try {
      await api({ method, url, data });

      fetchData(currentUser?.id, currentUser?.role);
      setShowAddDrawer(false);
      setEditingItem(null);
      if (msg) showNotification(msg, "success");
    }
    catch (err) {
      console.error(err);
      const serverFeedback = err.response?.data?.message || err.response?.data?.error || tr("System rejected the context", "Ağ Hatası Veya Yanlış Veri Girişi");
      showNotification(serverFeedback, "error");
    }
  };


  const filterByRole = (list, userField = 'personel') => {
    if (!currentUser || !list) return [];
    if (isAdmin) return list;
    if (isYonetici) return list.filter(item => {
      const targetDepId = userField === 'self' ? item.departman?.id : item[userField]?.departman?.id;
      return targetDepId === myDepId || item.id === currentUser.id || (item.personel && item.personel.id === currentUser.id);
    });
    return list.filter(item => (userField === 'self' ? item.id === currentUser.id : (item[userField] && item[userField].id === currentUser.id)));
  };

  const filterData = (list, isUserList = false) => {
    if (!list) return [];
    const roleFiltered = filterByRole(list, isUserList ? 'self' : 'personel');
    return roleFiltered.filter(item => {
      const s = searchTerm.toLowerCase();
      let matchSearch = true;
      if (s) {
        if (isUserList || item.firstName) {
          // If it's a user/personnel item, search in specific fields
          const target = isUserList ? item : (item.personel || item);
          const nameMatch = `${target.firstName} ${target.lastName}`.toLowerCase().includes(s);
          const emailMatch = (target.email || '').toLowerCase().includes(s);
          const unvanMatch = (target.unvan || '').toLowerCase().includes(s);
          const tcMatch = (target.tcKimlikNo || '').toLowerCase().includes(s);
          matchSearch = nameMatch || emailMatch || unvanMatch || tcMatch;
        } else {
          // Fallback for other lists (logs, etc)
          matchSearch = JSON.stringify(item).toLowerCase().includes(s);
        }
      }

      const matchStatus = statusFilter === 'All' ? true : item.durum === statusFilter;
      
      let matchDep = true;
      if (depFilter !== 'All') {
        const targetDepId = isUserList ? item.departman?.id : (item.personel?.departman?.id || item.departmanId);
        matchDep = String(targetDepId) === String(depFilter);
      }

      return matchSearch && matchStatus && matchDep;
    });
  };

  const handleFileAction = async (type = 'export', csvData = null) => {
    if (type === 'import' && csvData) {
      try {
        const lines = csvData.split('\n').filter(l => l.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          const obj = {};
          headers.forEach((header, i) => { obj[header] = values[i]; });
          return obj;
        });
        
        const response = await api.post('/users/bulk-import', data);
        const successCount = response.data.filter(r => r.success).length;
        const failCount = response.data.filter(r => !r.success).length;
        
        showNotification(tr(
          `Import finished. ${successCount} success, ${failCount} failed.`, 
          `İçe aktarma tamamlandı. ${successCount} başarılı, ${failCount} hatalı.`
        ), failCount > 0 ? "warning" : "success");
        
        fetchData(currentUser?.id);
      } catch (e) {
        console.error("Import Error:", e);
        showNotification(tr("Import Failed: " + (e.response?.data?.message || e.message), "İçe aktarma hatası: " + (e.response?.data?.message || e.message)), "error");
      }
      return;
    }

    let output = [];
    if (currentTab === 'personel') output = filterData(personeller).map(p => ({ ID: p.id, Isim: p.firstName, Soyisim: p.lastName, Unvan: p.unvan, Email: p.email, Tel: p.telefon, MesaiSaati: p.normalCalismaSaati, SaatlikUcret: p.saatlikUcret, GunlukUcret: p.gunlukUcret, IseGiris: p.iseGirisTarihi }));
    if (currentTab === 'maas') output = filterData(maaslar).map(m => ({ ID: m.id, Personel: m.personel?.firstName + ' ' + m.personel?.lastName, Brut: m.brutMaas, Net: m.temelMaas, Prim: m.prim, OdemeTarihi: m.odemeTarihi, Durum: m.durum }));
    if (currentTab === 'izin') output = filterData(izinler).map(i => ({ ID: i.id, Personel: i.personel?.firstName + ' ' + i.personel?.lastName, Tur: i.izinTuru, Baslangic: i.baslangicTarihi, Bitis: i.bitisTarihi, Durum: i.durum }));
    if (currentTab === 'gorevler') output = filterData(tasks).map(t => ({ ID: t.id, Personel: t.personel?.firstName + ' ' + t.personel?.lastName, Baslik: t.baslik, SonTarih: t.sonTarih, Durum: t.durum }));
    if (currentTab === 'harcamalar') output = filterData(expenses).map(e => ({ ID: e.id, Personel: e.personel?.firstName + ' ' + e.personel?.lastName, Baslik: e.baslik, Miktar: e.miktar, Tarih: e.tarih, Durum: e.durum }));
    if (currentTab === 'zimmet') output = filterData(zimmetler).map(z => ({ ID: z.id, Personel: z.personel?.firstName + ' ' + z.personel?.lastName, Esya: z.esyaAdi, Verilis: z.verilisTarihi }));

    if (output.length > 0) downloadCSV(output, `${currentTab}_raporu`);
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput; setChatInput('');
    if (chatTab === 'ai') {
      setAiChat(prev => [...prev, { isAi: false, text: msg }]);
      const res = await api.post('/users/ai-copilot', { prompt: msg });
      setAiChat(prev => [...prev, { isAi: true, text: res.data.response }]);
    } else {
      await api.post('/users/chat', { userId: currentUser.id, content: msg });
      const res = await api.get('/users/chat'); setChatMessages(res.data);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showNotification(tr("Email and password required", "E-posta ve şifre zorunludur"), "error");
      return;
    }

    // Basit E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginEmail)) {
      showNotification(tr("Invalid email format", "Lütfen geçerli bir e-posta adresi girin"), "error");
      return;
    }

    if (failedAttempts >= 3 && !captchaPassed) {
       if (captchaInput !== captchaCode) {
          showNotification(tr("Incorrect security code", "Güvenlik kodu hatalı, tekrar deneyin"), "error");
          generateCaptcha();
          return;
       }
       setCaptchaPassed(true);
    }

    setIsLoggingIn(true);
    try {
      const res = await api.post('/users/login', { email: loginEmail, password: loginPassword });
      
      // 🔐 GÜVENLİK: Eğer MFA Gerekliyse
      if (res.data.mfaRequired) {
        setTempToken(res.data.tempToken);
        setMfaStep(true);
        setIsLoggingIn(false);
        // Test amaçlı konsola link basıyoruz (gerçekte mail ile gider)
        if (res.data.previewUrl) console.log("🔑 [MFA] Mail Önizleme:", res.data.previewUrl);
        return;
      }

      localStorage.setItem('token', res.data.access_token);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setFailedAttempts(prev => prev + 1);
      
      const serverMessage = err.response?.data?.message;
      const displayMessage = serverMessage 
        ? (Array.isArray(serverMessage) ? serverMessage[0] : serverMessage) 
        : tr("Invalid credentials", "Sunucu ile iletişim kurulamadı veya bir hata oluştu.");

      showNotification(displayMessage, "error");
      setIsLoggingIn(false);
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    if (!mfaCode || mfaCode.length !== 6) {
      showNotification(tr("Enter 6-digit code", "E-postanıza gelen 6 haneli kodu giriniz."), "error");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await api.post('/users/verify-mfa', { tempToken, code: mfaCode });
      localStorage.setItem('token', res.data.access_token);
      window.location.reload();
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.message || tr("Invalid verification code", "Geçersiz doğrulama kodu."), "error");
      setIsLoggingIn(false);
      setMfaCode('');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return showNotification(tr("Please enter your email", "Lütfen e-posta adresinizi girin"), "error");
    setIsProcessing(true);
    try {
      await api.post('/users/forgot-password', { email: forgotEmail });
      showNotification(tr("Reset link sent! Please check your email (and console)", "Sıfırlama linki gönderildi! Lütfen e-postanızı (veya terminali) kontrol edin."), "success");
      setIsForgotMode(false);
    } catch (err) {
      showNotification(err.response?.data?.message || tr("Error occurred", "Bir hata oluştu"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPass !== confPass) return showNotification(tr("Passwords do not match", "Şifreler uyuşmuyor"), "error");
    if (newPass.length < 3) return showNotification(tr("Password too short", "Şifre çok kısa"), "error");
    setIsProcessing(true);
    try {
      await api.post('/users/reset-password', { token: resetToken, newPassword: newPass });
      showNotification(tr("Password updated! You can now login.", "Şifre başarıyla güncellendi! Giriş yapabilirsiniz."), "success");
      setResetToken(null);
      setNewPass(''); setConfPass('');
      window.history.replaceState({}, document.title, "/");
    } catch (err) {
      showNotification(err.response?.data?.message || tr("Link expired or invalid", "Link geçersiz veya süresi dolmuş"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMustChangePassword = async (e) => {
    e.preventDefault();
    if (!mustPass || mustPass.length < 3) return showNotification(tr("Password too short", "Şifre çok kısa"), "error");
    if (mustPass !== mustConf) return showNotification(tr("Passwords do not match", "Şifreler uyuşmuyor"), "error");
    
    setIsProcessing(true);
    try {
      await api.put(`/users/update-profile/${currentUser.id}`, { password: mustPass });
      showNotification(tr("Password changed successfully!", "Şifre başarıyla değiştirildi!"), "success");
      
      // Token'ı yenilemek için logout/login veya mevcut token'daki flag'i manuel temizlemek gerekebilir.
      // En güvenli yol token'ı silip tekrar login'e atmak veya state'i güncellemek.
      // Burada sadece state'i güncelliyoruz ve reload yapıyoruz ki backend'den yeni token gelsin (veya token'ı silebiliriz).
      localStorage.removeItem('token');
      window.location.reload();
    } catch (err) {
      showNotification(err.response?.data?.message || tr("An error occurred", "Bir hata oluştu"), "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoggedIn) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <Popups toast={toast} />
      <div className="absolute top-4 right-4"><Button variant="outline" onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')}>{lang}</Button></div>
      <div className="bg-zinc-900 p-10 rounded-xl w-full max-w-sm border border-zinc-800 shadow-xl text-center animate-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-white rounded-xl border border-zinc-200 mx-auto mb-6 flex items-center justify-center p-2 shadow-sm animate-in zoom-in duration-700">
          <img src={IMPARK_LOGO} alt="İMPARK Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">İmpark Yönetim Sistemi</h1>
        <p className="text-zinc-500 text-sm mb-8">{tr('Sign in to your account', 'Hesabınıza giriş yapın')}</p>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {mfaStep ? (
             <div className="space-y-4 animate-in slide-in-from-right-2">
                <p className="text-zinc-500 text-[11px] text-center mb-4 leading-relaxed">{tr('Check your email for the 6-digit security code. (Ethereal test user preview links are logged to terminal console)', 'Güvenlik kodu e-postanıza gönderildi.')}</p>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{tr('Security Code', 'Güvenlik Kodu')}</label>
                  <Input type="text" value={mfaCode} onChange={e => setMfaCode(e.target.value)} placeholder="000000" maxLength={6} className="text-center font-mono tracking-[0.5em] text-xl py-3" />
                </div>
                <Button type="button" onClick={handleMfaSubmit} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3" disabled={isLoggingIn}>{isLoggingIn ? tr('Verifying...', 'Doğrulanıyor...') : tr('Verify Code', 'Kodu Doğrula')}</Button>
                <button type="button" onClick={() => { setMfaStep(false); setTempToken(''); }} className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2">{tr('Back to Login', 'Girişe Dön')}</button>
             </div>
          ) : isResetMode ? (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <p className="text-zinc-500 text-xs text-center mb-4">{tr('Enter your new password below.', 'Yeni şifrenizi aşağıya girin.')}</p>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">{tr('New Password', 'Yeni Şifre')}</label>
                  <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">{tr('Confirm Password', 'Şifreyi Onayla')}</label>
                  <Input type="password" value={confPass} onChange={e => setConfPass(e.target.value)} placeholder="••••••••" />
                </div>
                <Button onClick={handleResetPassword} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isProcessing}>{isProcessing ? tr('Updating...', 'Güncelleniyor...') : tr('Update Password', 'Şifreyi Güncelle')}</Button>
                <button type="button" onClick={() => { setResetToken(null); window.history.replaceState({}, document.title, "/"); }} className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1">{tr('Cancel', 'İptal Et')}</button>
             </div>

          ) : isForgotMode ? (
             <div className="space-y-4 animate-in slide-in-from-top-2">
                <p className="text-zinc-500 text-xs text-center mb-4">{tr('Enter your email to receive a reset link.', 'Sıfırlama linki için e-posta adresinizi girin.')}</p>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">{tr('Email address', 'E-Posta adresi')}</label>
                  <Input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="name@company.com" />
                </div>
                <Button onClick={handleForgotPassword} className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={isProcessing}>{isProcessing ? tr('Sending...', 'Gönderiliyor...') : tr('Send Reset Link', 'Sıfırlama Linki Gönder')}</Button>
                <button type="button" onClick={() => setIsForgotMode(false)} className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1">{tr('Back to Login', 'Girişe Dön')}</button>
             </div>
          ) : (
             <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">{tr('Email address', 'E-Posta adresi')}</label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    disabled={isLoggingIn}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-zinc-400">{tr('Password', 'Şifre')}</label>
                    <button type="button" onClick={() => setIsForgotMode(true)} className="text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors uppercase font-bold tracking-tight">{tr('Forgot?', 'Şifremi Unuttum')}</button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    disabled={isLoggingIn || (failedAttempts >= 3 && !captchaPassed)}
                  />
                </div>

                {failedAttempts >= 3 && !captchaPassed && (
                  <div className="space-y-2 mt-4 p-4 bg-zinc-950/50 rounded-lg border border-red-500/30">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-red-400">{tr('Security Check', 'Robot Doğrulaması')}</label>
                      <button type="button" onClick={generateCaptcha} className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-zinc-300">
                        {tr('Refresh', 'Yenile')}
                      </button>
                    </div>
                    <div className="flex gap-2 items-stretch mt-1">
                      <div className="bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-xl tracking-[0.25em] font-bold py-2 px-4 rounded shadow-inner">
                        {captchaCode}
                      </div>
                      <Input
                        type="text"
                        placeholder="???"
                        className="text-center font-mono tracking-widest text-lg"
                        value={captchaInput}
                        onChange={e => setCaptchaInput(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 py-6" disabled={isLoggingIn}>
                   {isLoggingIn ? tr('Authenticating...', 'Giriş yapılıyor...') : tr('Sign In', 'Giriş Yap')}
                </Button>
             </>
          )}
        </form>
      </div>
    </div>
  );

  const calendarStatusConfig = {
    'Onaylandı': { bg: 'bg-emerald-500/20 border-emerald-500/30', text: 'text-emerald-300' },
    'Beklemede': { bg: 'bg-amber-500/20 border-amber-500/30', text: 'text-amber-300' },
    'Yönetici Onayladı': { bg: 'bg-indigo-500/20 border-indigo-500/30', text: 'text-indigo-300' },
    'Reddedildi': { bg: 'bg-red-500/20 border-red-500/30', text: 'text-red-300' },
  };

  const drawCalendar = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    let firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    if (firstDay === 0) firstDay = 7;

    const monthLeaves = izinler.filter(l => {
      const monthStart = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-01`;
      const monthEnd = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      return l.baslangicTarihi <= monthEnd && l.bitisTarihi >= monthStart;
    });

    const approvedCount = monthLeaves.filter(l => l.durum === 'Onaylandı').length;
    const pendingCount = monthLeaves.filter(l => l.durum === 'Beklemede' || l.durum === 'Yönetici Onayladı').length;
    const rejectedCount = monthLeaves.filter(l => l.durum === 'Reddedildi').length;
    const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

    const cells = [];
    for (let i = 1; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="min-h-[90px] bg-zinc-900/20 border border-zinc-900/40 rounded-lg" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const dayLeaves = monthLeaves.filter(l => l.baslangicTarihi <= dateStr && l.bitisTarihi >= dateStr);

      cells.push(
        <div key={d} className={`min-h-[90px] border rounded-lg p-1.5 overflow-hidden relative transition-all hover:border-zinc-600 ${isToday ? 'bg-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
          <span className={`text-[11px] font-bold absolute top-1.5 right-2 ${isToday ? 'text-indigo-400' : 'text-zinc-500'}`}>{d}</span>
          <div className="mt-5 flex flex-col gap-0.5">
            {dayLeaves.slice(0, 3).map(l => {
              const cfg = calendarStatusConfig[l.durum] || calendarStatusConfig['Beklemede'];
              const isSelected = hoveredLeave?.leave?.id === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => setHoveredLeave(isSelected ? null : { leave: l, day: d })}
                  className={`border ${cfg.bg} ${cfg.text} text-[9px] px-1.5 py-0.5 rounded truncate font-semibold cursor-pointer transition-all ${isSelected ? 'ring-1 ring-white/20 opacity-100' : 'opacity-80 hover:opacity-100'}`}
                >
                  {l.personel?.firstName} {l.personel?.lastName?.charAt(0)}.
                </div>
              );
            })}
            {dayLeaves.length > 3 && (
              <div className="text-[9px] text-zinc-500 px-1.5 font-semibold">+{dayLeaves.length - 3} daha</div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="animate-in slide-in-from-bottom-6 space-y-4">
        {/* Header & Navigation */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1); } else setCalendarMonth(m => m - 1); }} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 transition-colors text-sm font-bold">‹</button>
            <div>
              <h2 className="text-xl font-bold text-zinc-100">{monthNames[calendarMonth]} {calendarYear}</h2>
              <p className="text-xs text-zinc-500 mt-0.5">{daysInMonth} gün · {monthLeaves.length} izin kaydı</p>
            </div>
            <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1); } else setCalendarMonth(m => m + 1); }} className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center text-zinc-300 transition-colors text-sm font-bold">›</button>
            <button onClick={() => { setCalendarMonth(new Date().getMonth()); setCalendarYear(new Date().getFullYear()); setHoveredLeave(null); }} className="px-3 py-1.5 text-xs font-semibold bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-600/20 transition-colors">Bugün</button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40 border border-emerald-500/30 inline-block" />Onaylandı ({approvedCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500/30 inline-block" />Beklemede ({pendingCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500/30 inline-block" />Reddedildi ({rejectedCount})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500/40 border border-indigo-500/30 inline-block" />Yön. Onayladı</span>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1.5">
          {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Pzr'].map(day => (
            <div key={day} className={`text-center text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-md ${day === 'Cmt' || day === 'Pzr' ? 'text-indigo-500/60' : 'text-zinc-500'}`}>{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5">{cells}</div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      <Popups toast={toast} unreadAnnouncement={unreadAnnouncement} currentUser={currentUser} setUnreadAnnouncement={setUnreadAnnouncement} fetchData={fetchData} lang={lang} />
      
      {/* 🔐 GÜVENLİK: ZORUNLU ŞİFRE DEĞİŞTİRME EKRANI */}
      {currentUser?.mustChangePassword && (
        <div className="fixed inset-0 z-[999] bg-zinc-950 flex items-center justify-center p-6 backdrop-blur-md">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
               <Lock className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100 mb-2">{tr('Password Change Required', 'Şifre Değişikliği Zorunlu')}</h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
              {tr('Your account has been created with a temporary password. For your security, you must set a new password before continuing.', 'Hesabınız geçici bir şifre ile oluşturulmuştur. Güvenliğiniz için devam etmeden önce yeni bir şifre belirlemelisiniz.')}
            </p>

            <form onSubmit={handleMustChangePassword} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{tr('New Password', 'Yeni Şifre')}</label>
                  <Input type="password" value={mustPass} onChange={e => setMustPass(e.target.value)} placeholder="••••••••" required />
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{tr('Confirm New Password', 'Yeni Şifreyi Onayla')}</label>
                  <Input type="password" value={mustConf} onChange={e => setMustConf(e.target.value)} placeholder="••••••••" required />
               </div>
               <div className="pt-4">
                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 shadow-lg shadow-indigo-500/10" disabled={isProcessing}>
                    {isProcessing ? tr('Processing...', 'İşleniyor...') : tr('Update & Continue', 'Güncelle ve Devam Et')}
                  </Button>
               </div>
               <button type="button" onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2">
                 {tr('Logout', 'Çıkış Yap')}
               </button>
            </form>
          </div>
        </div>
      )}

      <MenuDrawer 
        currentTab={currentTab} 
        setCurrentTab={(val) => {
          if (val === 'toggleSidebar') {
            setSidebarOpen(!sidebarOpen);
          } else {
            setCurrentTab(val);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }
        }} 
        t={t} isManager={isManager} isAdmin={isAdmin} currentUser={currentUser} me={me} sidebarOpen={sidebarOpen} setEditingItem={setEditingItem} 
      />

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        <MainHeader 
          currentTab={currentTab} 
          searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
          statusFilter={statusFilter} setStatusFilter={setStatusFilter} 
          depFilter={depFilter} setDepFilter={setDepFilter}
          departmanlar={departmanlar}
          setShowAddDrawer={setShowAddDrawer} 
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} 
          lang={lang} setLang={setLang} 
          theme={theme} setTheme={setTheme} 
          notifOpen={notifOpen} setNotifOpen={setNotifOpen} 
          profileOpen={profileOpen} setProfileOpen={setProfileOpen} 
          notifications={notifications} 
          setEditingItem={setEditingItem} 
          me={me} onExport={handleFileAction} handleImport={(data) => handleFileAction('import', data)} setCurrentTab={setCurrentTab} 
        />

        <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">

          {/* TABLES */}
          {['personel', 'maas', 'mesai', 'harcamalar', 'yetki', 'logs'].includes(currentTab) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-full overflow-hidden shadow-sm animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-zinc-900/50 text-zinc-400 font-medium text-xs border-b border-zinc-800">
                      {currentTab === 'personel' && <><th className="px-6 py-4 border-r border-zinc-800 w-80">{tr('Staff Member', 'Personel')}</th><th className="px-6 border-r border-zinc-800">{tr('Email', 'E-Posta')}</th><th className="px-6 border-r border-zinc-800">{tr('Hours / Rate', 'Mesai / Ücret')}</th><th className="px-6 border-r border-zinc-800">{tr('Overtime Pay', 'Hak edilen Mesai')}</th><th className="px-6 border-r border-zinc-800">{tr('Leave Balance', 'Kalan İzin')}</th><th className="px-6 text-right">{tr('Actions', 'Eylemler')}</th></>}
                      {currentTab === 'maas' && <><th className="px-6 py-4 border-r border-zinc-800">{tr('Staff Member', 'Personel')}</th><th className="px-6 border-r border-zinc-800">{tr('Pay Period', 'Ödeme Dönemi')}</th><th className="px-6 border-r border-zinc-800">{tr('Net Total', 'Toplam Net')}</th><th className="px-6 border-r border-zinc-800">{tr('Status', 'Durum')}</th><th className="px-6 text-right">{tr('Action', 'Eylem')}</th></>}
                      {currentTab === 'yetki' && <><th className="px-6 py-4 border-r border-zinc-800">{tr('Staff Member', 'Personel')}</th><th className="px-6 border-r border-zinc-800">{tr('Job Title', 'Ünvan')}</th><th className="px-6 border-r border-zinc-800">{tr('Department', 'Birim')}</th><th className="px-6 border-r border-zinc-800">{tr('Role', 'Rol')}</th><th className="px-6 border-r border-zinc-800">{tr('Permissions', 'Yetkiler')}</th><th className="px-6 text-right">{tr('Action', 'Eylem')}</th></>}
                      {currentTab === 'mesai' && <><th className="px-6 py-4 border-r border-zinc-800">{tr('Staff Member', 'Personel')}</th><th className="px-6 border-r border-zinc-800">{tr('Date', 'Tarih')}</th><th className="px-6 border-r border-zinc-800 font-mono">{tr('In / Out', 'Giriş / Çıkış')}</th><th className="px-6 text-right">{tr('Manage', 'Yönetim')}</th></>}
                      {currentTab === 'harcamalar' && <><th className="px-6 py-4 border-r border-zinc-800">{tr('Staff Member', 'Personel')}</th><th className="px-6 border-r border-zinc-800">{tr('Expense Title', 'Harcama Adı')}</th><th className="px-6 border-r border-zinc-800">{tr('Amount', 'Miktar')}</th><th className="px-6 border-r border-zinc-800">{tr('Date', 'Tarih')}</th><th className="px-6 border-r border-zinc-800">{tr('Status', 'Durum')}</th><th className="px-6 text-right">{tr('Action', 'Eylem')}</th></>}
                      {currentTab === 'logs' && <><th className="px-6 py-4 border-r border-zinc-800 w-16">{tr('Method', 'Metot')}</th><th className="px-6 border-r border-zinc-800">{tr('Action Type', 'İşlem Tipi')}</th><th className="px-6 border-r border-zinc-800">{tr('Operator', 'Operatör')}</th><th className="px-6 border-r border-zinc-800">{tr('Timestamp', 'Zaman Damgası')}</th><th className="px-6 text-right">{tr('Details', 'Detay')}</th></>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {currentTab === 'personel' && filterData(personeller, true).map(p => (
                      <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row">
                        <td className="px-6 py-4 border-r border-zinc-800 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-sm text-indigo-400 border border-zinc-700">{p.firstName?.[0]}</div>
                          <div><p className="font-semibold text-zinc-100">{p.firstName} {p.lastName}</p><p className="text-xs text-zinc-500 mt-0.5">{p.unvan || tr('Unassigned', 'Ünvansız')}</p></div>
                        </td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400 font-mono text-xs italic">{p.email}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400">{p.normalCalismaSaati}h / {p.saatlikUcret} ₺ <span className="text-zinc-500 text-[10px] block mt-1">{p.gunlukUcret ? `${p.gunlukUcret} ₺ ${tr('Daily', 'Günlük')}` : ''}</span></td>
                        <td className="px-6 py-4 border-r border-zinc-800 font-medium text-emerald-500">{p.hakedilenMesaiUcreti?.toLocaleString()} ₺</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-amber-500 font-semibold">{p.kalanIzin} {tr('days', 'gün')}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => generateEmployeeCardPDF(p)} className="text-zinc-400 hover:text-emerald-400 font-medium px-2 py-1 transition-colors text-xs">{tr('CARD', 'KART (PDF)')}</button>
                          <button onClick={() => setEditingItem({ ...p, type: 'personel' })} className="text-zinc-400 hover:text-indigo-400 font-medium px-2 py-1 transition-colors text-xs">{tr('Profile', 'Profili Aç')}</button>
                          {isAdmin || currentUser?.canManagePersonnel ? (
                             <button onClick={() => handleAction('delete', `/users/${p.id}`, {}, tr("Deleted.", "Bağlantısı Kesildi."))} className="text-zinc-500 hover:text-red-500 font-medium px-2 py-1 transition-colors text-xs">{tr('Remove', 'Kaldır')}</button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                    {currentTab === 'logs' && (() => {
                      const filtered = logs.filter(l => {
                        const s = searchTerm.toLowerCase();
                        return (
                          (l.islem || '').toLowerCase().includes(s) ||
                          (l.yapanKisi || '').toLowerCase().includes(s) ||
                          (l.url || '').toLowerCase().includes(s)
                        );
                      });

                      return (
                        <>
                          <tr className="bg-zinc-900/50">
                            <td colSpan="5" className="px-6 py-3 border-b border-zinc-800">
                               <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{filtered.length} {tr('Logs Found', 'Kayıt Listeleniyor')}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <Button variant="outline" className="h-7 text-[10px] border-red-500/20 text-red-500 hover:bg-red-500/10" onClick={() => {
                                        if(window.confirm(tr('Are you sure you want to clear all system logs?', 'Tüm sistem kayıtlarını temizlemek istediğinize emin misiniz?'))) {
                                           handleAction('post', '/users/logs-clear', {}, tr('All logs cleared.', 'Sistem kayıtları temizlendi.'));
                                        }
                                     }}>{tr('Clear All Logs', 'Tümünü Temizle')}</Button>
                                  </div>
                               </div>
                            </td>
                          </tr>
                          {filtered.map(l => (
                            <tr key={l.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row group">
                              <td className="px-6 py-4 border-r border-zinc-800">
                                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.method === 'POST' ? 'bg-emerald-500/10 text-emerald-500' : l.method === 'PUT' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'}`}>{l.method}</span>
                              </td>
                              <td className="px-6 py-4 border-r border-zinc-800 text-zinc-300 font-medium">
                                 {l.islem} <span className="text-[10px] text-zinc-500 block font-mono">{l.url}</span>
                              </td>
                              <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400">@{l.yapanKisi}</td>
                              <td className="px-6 py-4 border-r border-zinc-800 text-zinc-500 text-xs font-mono">{l.tarih}</td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => setSelectedLog(l)} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">{tr('View', 'Detay')}</button>
                                    <button onClick={() => handleAction('delete', `/users/log-sil/${l.id}`, {}, tr('Log entry removed.', 'Kayıt silindi.'))} className="text-zinc-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </>
                      );
                    })()}
                    {currentTab === 'maas' && filterData(maaslar).map(m => (
                      <tr key={m.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row">
                        <td className="px-6 py-4 border-r border-zinc-800 font-medium text-zinc-100">{m.personel?.firstName} {m.personel?.lastName}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400 text-xs">{m.odemeTarihi}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-100 font-semibold">{(m.temelMaas + m.prim).toLocaleString()} ₺</td>
                        <td className="px-6 py-4 border-r border-zinc-800"><span className={`px-2 py-1 rounded-md text-[10px] font-semibold uppercase ${m.durum === 'Odendi' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{tr(m.durum, m.durum === 'Odendi' ? 'Ödendi' : 'Bekliyor')}</span></td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => generatePayslipPDF(m)} className="text-zinc-400 hover:text-indigo-400 font-medium px-2 py-1 transition-colors text-xs">{tr('PDF', 'PDF İndir')}</button>
                          {m.durum !== 'Odendi' && (isAdmin || currentUser?.canManageFinance) && <Button variant="success" className="h-8 px-4 text-xs inline-flex" onClick={() => handleAction('put', `/users/maas-odendi/${m.id}`, {}, tr("Payment Confirmed.", "Ödeme Onaylandı"))}>{tr('Pay Now', 'Ödemeyi Yap')}</Button>}
                        </td>
                      </tr>
                    ))}
                    {currentTab === 'yetki' && filterData(personeller, true).map(p => (
                      <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row">
                        <td className="px-6 py-4 border-r border-zinc-800 font-medium text-zinc-100">{p.firstName} {p.lastName}</td>
                        <td className="px-6 py-2 border-r border-zinc-800"><Input id={`unvan-${p.id}`} defaultValue={p.unvan} className="h-8 text-xs max-w-[150px]" /></td>
                        <td className="px-6 py-2 border-r border-zinc-800">
                          <Select id={`dep-${p.id}`} defaultValue={p.departman?.id || ''} className="h-8 text-xs py-1 max-w-[150px]">
                            <option value="">{tr('No Department', 'Atanmadı')}</option>
                            {departmanlar.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}
                          </Select>
                        </td>
                        <td className="px-6 py-2 border-r border-zinc-800">
                          <Select id={`role-${p.id}`} defaultValue={p.role} className="h-8 text-xs py-1 max-w-[120px]">
                            <option value="personel">{tr('Staff', 'Personel')}</option><option value="yonetici">{tr('Manager', 'Yönetici')}</option><option value="admin">Admin</option>
                          </Select>
                        </td>
                        <td className="px-6 py-2 border-r border-zinc-800">
                           <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <label className="flex items-center gap-2 text-[10px] cursor-pointer text-zinc-400 hover:text-zinc-200"><input id={`prm-p-${p.id}`} type="checkbox" defaultChecked={p.canManagePersonnel} className="w-3 h-3 rounded bg-zinc-950 border-zinc-700" /> {tr('HR', 'İK/Pers')}</label>
                              <label className="flex items-center gap-2 text-[10px] cursor-pointer text-zinc-400 hover:text-zinc-200"><input id={`prm-f-${p.id}`} type="checkbox" defaultChecked={p.canManageFinance} className="w-3 h-3 rounded bg-zinc-950 border-zinc-700" /> {tr('Finance', 'Finans')}</label>
                              <label className="flex items-center gap-2 text-[10px] cursor-pointer text-zinc-400 hover:text-zinc-200"><input id={`prm-l-${p.id}`} type="checkbox" defaultChecked={p.canApproveLeaves} className="w-3 h-3 rounded bg-zinc-950 border-zinc-700" /> {tr('Leaves', 'İzinler')}</label>
                              <label className="flex items-center gap-2 text-[10px] cursor-pointer text-zinc-400 hover:text-zinc-200"><input id={`prm-i-${p.id}`} type="checkbox" defaultChecked={p.canManageInventory} className="w-3 h-3 rounded bg-zinc-950 border-zinc-700" /> {tr('Assets', 'Zimmet')}</label>
                           </div>
                        </td>
                        <td className="px-6 py-2 text-right"><Button className="h-8 px-4 text-xs inline-flex" onClick={() => yetkiGuncelle(p.id)}>{tr('Save', 'Kaydet')}</Button></td>
                      </tr>
                    ))}
                    {currentTab === 'mesai' && filterData(mesailer).map(m => (
                      <tr key={m.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row">
                        <td className="px-6 py-4 border-r border-zinc-800 font-medium text-zinc-100">{m.personel?.firstName} {m.personel?.lastName}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400 text-xs">{m.tarih}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 font-mono text-zinc-200">{m.girisSaati} / <span className={m.cikisSaati ? 'text-zinc-400' : 'text-amber-500'}>{m.cikisSaati || tr('Active', 'Kayıt Açık')}</span></td>
                        <td className="px-6 py-4 text-right">{!m.cikisSaati && (isManager || m.personel?.id === currentUser?.id) && <button onClick={() => { let c = prompt(tr("Exit Time (HH:mm):", "Çıkış Saati (SS:dd)"), new Date().toTimeString().substring(0, 5)); if (c) handleAction('put', `/users/mesai-bitir/${m.id}`, { cikisSaati: c, toplamCalisma: 8 }) }} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">{tr('End Shift', 'Mesai Bitir')}</button>}</td>
                      </tr>
                    ))}
                    {currentTab === 'harcamalar' && filterData(expenses).map(exp => (
                      <tr key={exp.id} className="hover:bg-zinc-800/50 transition-colors hidden lg:table-row">
                        <td className="px-6 py-4 border-r border-zinc-800 font-medium text-zinc-100">{exp.personel?.firstName} {exp.personel?.lastName}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-300">{exp.baslik}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-100 font-semibold">{Number(exp.miktar || 0).toLocaleString()} ₺</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-500 text-xs">{exp.tarih}</td>
                        <td className="px-6 py-4 border-r border-zinc-800 text-zinc-400">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            exp.durum === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                            exp.durum === 'Yönetici Onayladı' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' : 
                            exp.durum === 'Reddedildi' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                            'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {tr(exp.durum, exp.durum)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                           {(
                             (isAdmin && (exp.durum === 'Beklemede' || exp.durum === 'Yönetici Onayladı')) ||
                             (isYonetici && exp.durum === 'Beklemede' && exp.personel?.departman?.id === myDepId)
                           ) && (
                             <>
                               <Button variant="success" className="h-7 text-[10px] px-3" onClick={() => handleAction('put', `/users/expense-onay/${exp.id}`, { durum: 'Onaylandı' }, tr("Expense Approved", "Harcama Onaylandı"))}>
                                 {exp.durum === 'Yönetici Onayladı' ? tr('Final Approve', 'Kesin Onayla') : tr('Approve', 'Onayla')}
                               </Button>
                               <Button variant="outline" className="h-7 text-[10px] px-3 border-zinc-700 hover:text-red-500" onClick={() => handleAction('put', `/users/expense-onay/${exp.id}`, { durum: 'Reddedildi' }, tr("Expense Declined", "Harcama Reddedildi"))}>
                                 {tr('Decline', 'Reddet')}
                               </Button>
                             </>
                           )}
                           {exp.personel?.id === currentUser?.id && exp.durum === 'Beklemede' && (
                             <button onClick={() => handleAction('delete', `/users/expense-sil/${exp.id}`, {}, tr("Request Deleted", "Talep Silindi"))} className="text-zinc-500 hover:text-red-500 text-xs transition-colors">
                               {tr('Cancel', 'İptal Et')}
                             </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MOBILE CARDS VIEW */}
          {['personel', 'maas', 'mesai', 'harcamalar', 'yetki'].includes(currentTab) && (
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
               {currentTab === 'personel' && filterData(personeller, true).map(p => (
                 <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-4 shadow-sm relative group overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-3xl -mr-4 -mt-4 transition-all group-hover:bg-indigo-500/10"></div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-lg text-indigo-400 border border-zinc-700">{p.firstName?.[0]}</div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-zinc-100 truncate">{p.firstName} {p.lastName}</h4>
                         <p className="text-[11px] text-zinc-500 truncate uppercase tracking-tighter">{p.unvan || tr('Unassigned', 'Ünvansız')}</p>
                      </div>
                      <div className="text-right">
                         <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-1 rounded-md border border-amber-500/20">{p.kalanIzin} Gün</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-zinc-800/50">
                       <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">{tr('Email', 'E-Posta')}</p>
                          <p className="text-xs text-zinc-300 truncate font-mono">{p.email}</p>
                       </div>
                       <div>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">{tr('Payroll', 'Hakedilen')}</p>
                          <p className="text-xs text-emerald-500 font-bold">{p.hakedilenMesaiUcreti?.toLocaleString()} ₺</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => generateEmployeeCardPDF(p)} className="flex-1 h-9 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700">{tr('PDF', 'PDF İndir')}</Button>
                       <Button onClick={() => setEditingItem({ ...p, type: 'personel' })} className="flex-1 h-9 text-[10px] bg-indigo-600 hover:bg-indigo-500">{tr('Profile', 'Profili Aç')}</Button>
                    </div>
                 </div>
               ))}

               {currentTab === 'harcamalar' && filterData(expenses).map(e => (
                 <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-bold text-zinc-100">{e.baslik}</h4>
                          <p className="text-[10px] text-zinc-500">{e.personel?.firstName} {e.personel?.lastName}</p>
                       </div>
                       <span className={`px-2 py-1 rounded text-[10px] font-bold ${e.durum === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{e.durum}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-3">
                       <span className="font-bold text-zinc-200">{Number(e.miktar).toLocaleString()} ₺</span>
                       <span className="text-zinc-500 font-mono text-[10px]">{e.tarih}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                       {isAdmin && e.durum !== 'Onaylandı' && <Button variant="success" className="flex-1 h-8 text-[10px]" onClick={() => handleAction('put', `/users/harcama-guncelle/${e.id}`, { durum: 'Onaylandı' }, tr('Expense approved.', 'Harcama onaylandı.'))}>{tr('Approve', 'Onayla')}</Button>}
                       <Button variant="outline" className="flex-1 h-8 text-[10px]" onClick={() => setEditingItem({ ...e, type: 'expense' })}>{tr('View', 'Gör')}</Button>
                    </div>
                 </div>
               ))}

               {currentTab === 'maas' && filterData(maaslar).map(m => (
                 <div key={m.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                       <div>
                          <h4 className="font-bold text-zinc-100">{m.personel?.firstName} {m.personel?.lastName}</h4>
                          <p className="text-[10px] text-zinc-500 italic">{m.odemeTarihi} {tr('Payroll', 'Bordrosu')}</p>
                       </div>
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${m.durum === 'Ödendi' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{m.durum}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs border-t border-zinc-800 pt-3 font-mono">
                       <span className="text-zinc-400">{tr('Net', 'Net')}</span>
                       <span className="font-bold text-zinc-100">{m.netMaas?.toLocaleString()} ₺</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <Button variant="outline" className="flex-1 h-8 text-[10px]" onClick={() => setEditingItem({ ...m, type: 'maas' })}>{tr('Details', 'Detaylar')}</Button>
                    </div>
                 </div>
               ))}

                    {currentTab === 'yetki' && filterData(personeller).map(p => (
                 <div key={p.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-indigo-400">{p.firstName?.[0]}</div>
                       <div>
                          <p className="text-xs font-bold text-zinc-100">{p.firstName} {p.lastName}</p>
                          <p className="text-[10px] text-zinc-500">{p.unvan}</p>
                       </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-zinc-800/50">
                       <span className="text-[10px] text-zinc-500 uppercase font-bold">{tr('Role', 'Rol')}</span>
                       <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase">{p.role}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <Button variant="outline" className="w-full h-8 text-[10px]" onClick={() => setEditingItem({ ...p, type: 'personel' })}>{tr('Manage Permissions', 'Yetkileri Düzenle')}</Button>
                    </div>
                 </div>
               ))}

               {currentTab === 'mesai' && filterData(mesailer).map(ms => (
                 <div key={ms.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                       <p className="text-xs font-bold text-zinc-100">{ms.personel?.firstName} {ms.personel?.lastName}</p>
                       <span className="text-[10px] font-mono text-zinc-500">{ms.tarih}</span>
                    </div>
                    <div className="flex items-center gap-4 py-2 border-y border-zinc-800/50 mt-1">
                       <div className="flex-1">
                          <p className="text-[9px] text-zinc-500 uppercase">{tr('In', 'Giriş')}</p>
                          <p className="text-xs font-mono text-emerald-400 font-bold">{ms.girisSaati}</p>
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] text-zinc-500 uppercase">{tr('Out', 'Çıkış')}</p>
                          <p className="text-xs font-mono text-amber-400 font-bold">{ms.cikisSaati || '--:--'}</p>
                       </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <Button variant="outline" className="w-full h-8 text-[10px]" onClick={() => setEditingItem({ ...ms, type: 'mesai' })}>{tr('Edit', 'Düzenle')}</Button>
                    </div>
                 </div>
               ))}

               {currentTab === 'logs' && logs.slice(0, 20).map(l => (
                 <div key={l.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                       <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${l.method === 'POST' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>{l.method}</span>
                       <span className="text-[9px] font-mono text-zinc-600">{l.tarih}</span>
                    </div>
                    <p className="text-xs text-zinc-200 font-medium leading-tight">{l.islem}</p>
                    <p className="text-[10px] text-zinc-500">@{l.yapanKisi}</p>
                 </div>
               ))}
               
               {/* Diğer tablar da benzer şekilde eklenebilir... */}
            </div>
          )}

          {['home', 'dashboard', 'performans', 'duyuru_arşiv', 'izin', 'gorevler', 'trash', 'belgeler', 'departman', 'zimmet', 'onboarding', 'raporlar', 'security'].includes(currentTab) && !['personel', 'maas', 'mesai', 'harcamalar', 'yetki', 'logs'].includes(currentTab) && (
            <div className="space-y-8 animate-in fade-in duration-500">

              {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-sm mb-4">
                     <div>
                       <h2 className="text-xl font-bold text-zinc-100">{tr('Overview Panel', 'Özet Yönetim Paneli')}</h2>
                       <p className="text-sm text-zinc-500 mt-1">{tr('Real-time operational metrics and analysis.', 'Anlık operasyonel veriler ve analizler.')}</p>
                     </div>
                     <Button 
                       variant="outline" 
                       className="gap-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300"
                       onClick={() => setShowCustomizer(true)}
                     >
                       <Settings className="w-4 h-4" /> {tr('Customize Layout', 'Görünümü Düzenle')}
                     </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardLayout.includes('stat_staff') && <StatWidget label={tr('Total Staff', 'Personel')} value={stats.totalUsers} icon={Users} color="text-indigo-500" tr={tr} />}
                    {dashboardLayout.includes('stat_leaves') && <StatWidget label={tr('Pending Leaves', 'Bekleyen İzinler')} value={stats.pendingIzins} icon={CalendarClock} color="text-amber-500" tr={tr} />}
                    {dashboardLayout.includes('stat_deps') && <StatWidget label={tr('Active Departments', 'Birim Sayısı')} value={stats.totalDeps} icon={Building} color="text-emerald-500" tr={tr} />}
                    {dashboardLayout.includes('stat_budget') && <StatWidget label={tr('Monthly Payroll', 'Aylık Maaş Dağılımı')} value={`${(stats.totalBudget || 0).toLocaleString()} ₺`} icon={HandCoins} color="text-zinc-400" tr={tr} />}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {dashboardLayout.includes('chart_deps') && <DepartmentPieWidget data={stats?.chartData || []} tr={tr} />}
                    {dashboardLayout.includes('chart_expenses') && (
                      <ExpenseBarWidget 
                        data={[
                          { name: tr('Payroll', 'Maaşlar'), value: stats?.totalBudget || 0 }, 
                          ...(expenses || []).slice(0, 5).map(e => ({ name: (e?.baslik || '').substring(0, 10), value: e?.miktar || 0 }))
                        ]} 
                        tr={tr} 
                      />
                    )}
                  </div>

                  {showCustomizer && (
                    <GenericCustomizer 
                       title={tr('Customize Dashboard', 'Paneli Özelleştir')}
                       description={tr('Select which widgets to display.', 'Ekranda görünecek modülleri seçin.')}
                       items={[
                        { id: 'stat_staff', label: tr('Total Staff', 'Toplam Personel') },
                        { id: 'stat_leaves', label: tr('Pending Leaves', 'Bekleyen İzinler') },
                        { id: 'stat_deps', label: tr('Active Departments', 'Birim Sayısı') },
                        { id: 'stat_budget', label: tr('Monthly Payroll', 'Aylık Maaş Dağılımı') },
                        { id: 'chart_deps', label: tr('Department Spread', 'Departman Dağılımı (Pasta)') },
                        { id: 'chart_expenses', label: tr('Expense Distribution', 'Gider Analizi (Bar)') },
                       ]}
                       layout={dashboardLayout} 
                       setLayout={setDashboardLayout} 
                       onSave={saveDashboardLayout} 
                       onClose={() => setShowCustomizer(false)} 
                       tr={tr} 
                    />
                  )}
                </div>
              )}

              {currentTab === 'home' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-sm mb-4">
                     <div>
                       <h2 className="text-xl font-bold text-zinc-100">{tr('Welcome Back', 'Hoş Geldiniz')}, {currentUser?.name} 👋</h2>
                       <p className="text-sm text-zinc-500 mt-1">{tr('Here is what\'s happening today.', 'Bugün olan bitene hızlıca göz atın.')}</p>
                     </div>
                     <Button 
                       variant="outline" 
                       className="gap-2 border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300"
                       onClick={() => setShowHomeCustomizer(true)}
                     >
                       <Settings className="w-4 h-4" /> {tr('Customize Home', 'Ana Sayfayı Düzenle')}
                     </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {homeLayout.includes('welcome') && (
                      <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-zinc-900 p-8 rounded-3xl border border-indigo-500/20 shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                        <h3 className="text-2xl font-bold text-white mb-2">{new Date().toLocaleDateString(lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                        <p className="text-indigo-200/70 text-sm max-w-md">{tr('Let\'s focus on productivity today. You have pending items to check.', 'Bugün harika işler çıkarabiliriz. Bekleyen görevlerine göz atmayı unutma.')}</p>
                        <div className="mt-8 flex gap-4">
                           <div className="bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[11px] text-indigo-100 flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              {tr('Shift Status: Active', 'Mesai: Aktif')}
                           </div>
                        </div>
                      </div>
                    )}

                    {homeLayout.includes('month_stats') && (
                      <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex flex-col justify-between">
                         <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">{tr('Monthly Summary', 'Aylık Özet')}</h4>
                         <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                               <span className="text-sm text-zinc-400">{tr('Completed Tasks', 'Tamamlanan Görev')}</span>
                               <span className="text-sm font-bold text-zinc-100">{tasks.filter(t => t.tamamlandi && t.personel?.id === currentUser.id && new Date(t.tamamlamaTarihi || '').getMonth() === new Date().getMonth()).length}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800/50">
                               <span className="text-sm text-zinc-400">{tr('Total Overtime', 'Fazla Mesai Saati')}</span>
                               <span className="text-sm font-bold text-zinc-100">8.5 Saat</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <span className="text-sm text-zinc-400">{tr('Remaining Leave', 'Kalan İzin')}</span>
                               <span className="text-sm font-bold text-emerald-400">{me?.toplamIzinHakki || 14} Gün</span>
                            </div>
                         </div>
                      </div>
                    )}

                    {homeLayout.includes('notes') && (
                      <div className="lg:col-span-1 xl:col-span-1 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex flex-col gap-4">
                         <div className="flex justify-between items-center">
                            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{tr('Personal Notes', 'Kişisel Notlar')}</h4>
                            <button onClick={savePersonalNotes} className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 transition-colors uppercase tracking-tighter">
                               {tr('Save Now', 'Kaydet')}
                            </button>
                         </div>
                         <textarea 
                           className="flex-1 min-h-[150px] bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-300 outline-none focus:border-indigo-500/50 transition-all resize-none custom-scrollbar" 
                           placeholder={tr('Write your private notes here...', 'Buraya sadece senin görebileceğin notlar alabilirsin...')}
                           value={personalNotes}
                           onChange={(e) => setPersonalNotes(e.target.value)}
                         />
                         <p className="text-[10px] text-zinc-600 italic">🔒 {tr('Notes are strictly private and not shared.', 'Notlar tamamen gizlidir, paylaşılmaz.')}</p>
                      </div>
                    )}

                    {homeLayout.includes('announcements') && (
                      <div className="lg:col-span-2 xl:col-span-2 bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-sm flex flex-col gap-4 max-h-[400px]">
                         <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{tr('Announcements', 'Duyurular')}</h4>
                         <div className="space-y-3 overflow-auto custom-scrollbar pr-2">
                           {duyurular.slice(0, 3).map(dy => (
                             <div key={dy.id} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all cursor-pointer group">
                                <h5 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                   {dy.baslik}
                                </h5>
                                <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{dy.icerik}</p>
                             </div>
                           ))}
                           {duyurular.length === 0 && <p className="text-xs text-zinc-600 py-8 text-center">{tr('No active announcements.', 'Güncel duyuru yok.')}</p>}
                         </div>
                      </div>
                    )}
                  </div>

                  {showHomeCustomizer && (
                    <GenericCustomizer 
                      title={tr('Customize Home', 'Ana Sayfayı Özelleştir')}
                      description={tr('Select which section to display.', 'Ana sayfada görünecek bölümleri seçin.')}
                      items={[
                        { id: 'welcome', label: tr('Welcome Card', 'Karşılama Kartı') },
                        { id: 'month_stats', label: tr('Monthly Summary', 'Aylık Özet') },
                        { id: 'announcements', label: tr('Announcements', 'Duyurular') },
                        { id: 'notes', label: tr('Personal Notes', 'Kişisel Notlar') },
                      ]}
                      layout={homeLayout} 
                      setLayout={setHomeLayout} 
                      onSave={saveHomeLayout} 
                      onClose={() => setShowHomeCustomizer(false)} 
                      tr={tr} 
                    />
                  )}
                </div>
              )}

              {currentTab === 'security' && (
                <div className="col-span-full animate-in fade-in slide-in-from-bottom-6 space-y-6">
                  <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-indigo-500" /> {tr('Security Audit Center', 'Güvenlik Denetim Merkezi')}
                      </h3>
                      <p className="text-zinc-500 text-sm mt-2 max-w-xl">{tr('Perform deep analysis of your system. Scanning for XSS injections, weak configurations, and outdated dependencies.', 'Sisteminizi derinlemesine analiz edin. XSS enjeksiyonları, zayıf konfigürasyonlar ve güncel olmayan bağımlılıklar taranır.')}</p>
                    </div>
                    <Button 
                      onClick={async () => {
                         setIsScanning(true);
                         try {
                           const res = await api.post('/security/scan');
                           setSecurityReport(res.data.report);
                           showNotification(tr('Security scan completed.', 'Güvenlik taraması başarıyla tamamlandı.'));
                         } catch(e) {
                           showNotification(tr('Scan failed.', 'Tarama başarısız oldu.'), 'error');
                         } finally {
                           setIsScanning(false);
                         }
                      }}
                      disabled={isScanning}
                      className={`h-12 px-8 font-bold text-sm shadow-lg shadow-indigo-500/10 transition-all ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      {isScanning ? tr('Scanning...', 'Taranıyor...') : tr('Start Full Audit', 'Tam Denetimi Başlat')}
                    </Button>
                  </div>

                  {securityReport && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in zoom-in duration-500">
                      {/* Score Card */}
                      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center text-center">
                         <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                            <svg className="w-full h-full -rotate-90">
                               <circle cx="64" cy="64" r="60" fill="transparent" stroke="#27272a" strokeWidth="8" />
                               <circle cx="64" cy="64" r="60" fill="transparent" stroke={securityReport.score > 80 ? '#10b981' : securityReport.score > 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * securityReport.score) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                            </svg>
                            <span className="absolute text-3xl font-black text-zinc-100">{securityReport.score}</span>
                         </div>
                         <h4 className="font-bold text-zinc-300 uppercase tracking-widest text-xs">{tr('Security Health Score', 'Güvenlik Sağlık Puanı')}</h4>
                         <p className="text-[10px] text-zinc-500 mt-2">{tr('Based on last scan:', 'Son tarama zamanı:')} {new Date(securityReport.timestamp).toLocaleString()}</p>
                      </div>

                      {/* Summary Cards */}
                      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                         {[
                            { label: 'Dependencies', val: securityReport.summary.dependencies, icon: FolderOpen, color: securityReport.summary.dependencies === 'OK' ? 'text-emerald-500' : 'text-amber-500' },
                            { label: 'XSS Guard', val: securityReport.summary.xss, icon: Shield, color: securityReport.summary.xss === 'OK' ? 'text-emerald-500' : 'text-red-500' },
                            { label: 'Cloud Config', val: securityReport.summary.config, icon: Activity, color: securityReport.summary.config === 'OK' ? 'text-emerald-500' : 'text-amber-500' }
                         ].map((s, idx) => (
                           <div key={idx} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-between">
                              <s.icon className={`w-6 h-6 ${s.color} mb-4`} />
                              <div>
                                 <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">{s.label}</p>
                                 <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                              </div>
                           </div>
                         ))}
                      </div>

                      {/* Detailed Vulnerabilities */}
                      <div className="col-span-full space-y-4">
                         <h4 className="text-zinc-400 font-bold text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> {tr('Detected Vulnerabilities & Recommendations', 'Tespit Edilen Zafiyetler ve Öneriler')}
                         </h4>
                         {securityReport.vulnerabilities.length === 0 ? (
                           <div className="p-12 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-2xl text-center text-emerald-500/60 font-medium">
                              ✨ {tr('No vulnerabilities found in recent scan. System is healthy.', 'Tarama sonucunda zafiyet bulunamadı. Sistem sağlıklı.')}
                           </div>
                         ) : (
                           <div className="space-y-3">
                              {securityReport.vulnerabilities.map((v, i) => (
                                <div key={i} className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-6">
                                   <div className={`px-3 py-1 rounded-full text-[9px] font-black h-fit w-fit ${v.severity === 'CRITICAL' || v.severity === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>{v.severity}</div>
                                   <div className="flex-1 space-y-2">
                                      <h5 className="font-bold text-zinc-100 flex items-center gap-2">
                                         <span className="text-zinc-600">[{v.type}]</span> {v.description}
                                      </h5>
                                      <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800/50 text-[11px] text-zinc-400 italic">
                                         <span className="font-bold text-indigo-400 uppercase not-italic mr-2">Pro-Tip:</span> {v.recommendation}
                                      </div>
                                   </div>
                                </div>
                              ))}
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentTab === 'raporlar' && (
                <div className="col-span-full">
                  <ReportsDashboard 
                    personeller={personeller} 
                    departmanlar={departmanlar} 
                    izinler={izinler} 
                    maaslar={maaslar} 
                    tasks={tasks} 
                    expenses={expenses} 
                    tr={tr} 
                  />
                </div>
              )}

              {currentTab === 'performans' && (
                <div className="col-span-full animate-in slide-in-from-bottom-6">
                  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex flex-col gap-6">
                    <div>
                      <h3 className="text-zinc-100 font-bold mb-1 text-lg flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" /> {tr('AI Performance Leaderboard', 'Yapay Zeka Personel Değerlendirmesi')}
                      </h3>
                      <p className="text-zinc-500 text-xs 2xl:w-1/2">{tr('The generative AI analyzes work pace, task completion gaps, leave records, and generates specialized reports for HR analysis.', 'Yapay zeka asistanı personelin görevlerini, mesai sürelerini ve izin döngülerini analiz ederek yöneticilere genel bir verimlilik değerlendirmesi sunar.')}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap lg:whitespace-normal">
                        <thead>
                          <tr className="bg-zinc-900/50 text-zinc-400 font-medium text-xs border-b border-zinc-800">
                            <th className="px-6 py-4 border-r border-zinc-800">{tr('Staff Member', 'Personel')}</th>
                            <th className="px-6 border-r border-zinc-800">{tr('AI Score', 'Puan')}</th>
                            <th className="px-6 border-r border-zinc-800">{tr('Badge Level', 'AI Seviye Rozeti')}</th>
                            <th className="px-6 border-r border-zinc-800 w-1/3">{tr('Contextual Review', 'Durumsal Değerlendirme')}</th>
                            <th className="px-6 text-right w-32">{tr('Command', 'Aksiyon / Talimat')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                          {filterData(personeller, true).sort((a, b) => (b.performansPuani || 0) - (a.performansPuani || 0)).map(p => (
                            <tr key={p.id} className="hover:bg-zinc-800/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-zinc-100 border-r border-zinc-800">{p.firstName} {p.lastName}</td>
                              <td className="px-6 py-4 border-r border-zinc-800">
                                <div className="flex items-center gap-3 w-40">
                                  <div className="flex-1 bg-zinc-800 rounded-full h-2">
                                    <div className={`h-2 rounded-full ${p.performansPuani > 80 ? 'bg-emerald-500' : p.performansPuani > 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p.performansPuani || 0}%` }}></div>
                                  </div>
                                  <span className="font-mono text-zinc-300 font-bold">{p.performansPuani || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 border-r border-zinc-800 text-lg">{p.performansRozeti || '❌'}</td>
                              <td className="px-6 py-4 text-[11px] text-zinc-400 italic font-medium leading-relaxed border-r border-zinc-800">"{p.performansDegerlendirmesi || tr('No analysis log available yet.', 'Kayıtlı performans analiz raporu bulunmuyor.')}"</td>
                              <td className="px-6 py-4 text-right">
                                {isAdmin && <Button variant="outline" className="h-8 text-[10px] w-full" onClick={() => handleAction('post', `/users/performance/ai-evaluate/${p.id}`, {}, tr('Evaluation request delivered to AI.', 'Bordro analiz talebi Yapay Zeka\'ya iletildi.'))}>{tr('Trigger AI', 'Analiz Çıkar')}</Button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentTab === 'gorevler' && (
                  <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-6">
                    {['Beklemede', 'Yapılıyor', 'Tamamlandı'].map(colStatus => {
                      const colTasks = filterData(tasks).filter(t => t.durum === colStatus);
                      const bgMap = { 'Beklemede': 'bg-zinc-900 border-zinc-800', 'Yapılıyor': 'bg-indigo-950/20 border-indigo-500/20', 'Tamamlandı': 'bg-emerald-950/20 border-emerald-500/20' };

                      return (
                        <div key={colStatus} className={`flex flex-col border rounded-xl overflow-hidden shadow-sm ${bgMap[colStatus]}`}>
                          <div className="p-4 border-b border-inherit bg-black/20 flex justify-between items-center">
                            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
                              {colStatus === 'Beklemede' ? '📌 ' : colStatus === 'Yapılıyor' ? '⏳ ' : '✅ '}
                              {tr(colStatus === 'Beklemede' ? 'To Do' : colStatus === 'Yapılıyor' ? 'In Progress' : 'Done', colStatus)}
                            </h3>
                            <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center bg-zinc-950 border border-zinc-800 text-zinc-400">{colTasks.length}</span>
                          </div>
                          <div className="flex-1 p-4 space-y-4 min-h-[400px] bg-zinc-950/30">
                            {colTasks.length === 0 && <p className="text-xs text-center text-zinc-600 font-medium py-10 border border-dashed border-zinc-800 rounded-lg">{tr('No tasks here.', 'Bu blok boş.')}</p>}
                            {colTasks.map(t => (
                              <div key={t.id} className="bg-zinc-950 p-5 rounded-lg border border-zinc-800 shadow-sm hover:border-zinc-700 transition-all flex flex-col group">
                                <h4 className="text-sm font-bold text-zinc-100 mb-1.5 leading-tight">{t.baslik}</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">{t.aciklama}</p>
                                <div className="mt-auto">
                                  <div className="flex justify-between items-center text-[10px] font-medium text-zinc-500 mb-4 pb-3 border-b border-zinc-800/50">
                                    <span className="flex items-center bg-zinc-900 px-2 py-1 rounded border border-zinc-800"><Users className="w-3 h-3 mr-1" /> {t.personel?.firstName}</span>
                                    <span className="flex items-center"><CalendarClock className="w-3 h-3 mr-1" /> {t.sonTarih}</span>
                                  </div>
                                  <div className="flex gap-2 justify-end">
                                    {(isManager || t.personel?.id === currentUser?.id) && (
                                      <>
                                        {colStatus !== 'Beklemede' && <button onClick={() => handleAction('put', `/users/task-guncelle/${t.id}`, { durum: colStatus === 'Tamamlandı' ? 'Yapılıyor' : 'Beklemede' })} className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-semibold hover:text-zinc-200 transition-colors">{tr('← Move Back', '← Geri Al')}</button>}
                                        {colStatus !== 'Tamamlandı' && <button onClick={() => handleAction('put', `/users/task-guncelle/${t.id}`, { durum: colStatus === 'Beklemede' ? 'Yapılıyor' : 'Tamamlandı' })} className="px-3 py-1.5 rounded bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-semibold hover:bg-indigo-600/20 transition-colors">{tr('Move Forward →', 'İleri Taşı →')}</button>}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {currentTab === 'izin' && (
                  <div className="col-span-full mb-4 flex justify-end">
                    <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg flex gap-1">
                      <button onClick={() => setLeaveView('list')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${leaveView === 'list' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>{tr('List Data', 'Liste Verisi')}</button>
                      <button onClick={() => setLeaveView('calendar')} className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${leaveView === 'calendar' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>{tr('Calendar Map', 'Takvim Planı')}</button>
                    </div>
                  </div>
                )}

                {currentTab === 'izin' && leaveView === 'calendar' && (
                  <div className="col-span-full space-y-3">
                    {drawCalendar()}
                    {/* Seçili İzin Detay Paneli - drawCalendar dışında render edilir, titremeyi önler */}
                    {hoveredLeave && (
                      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 flex items-start justify-between gap-4 shadow-lg animate-in slide-in-from-bottom-2 duration-200">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-bold text-zinc-100 text-base">{hoveredLeave.leave.personel?.firstName} {hoveredLeave.leave.personel?.lastName}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${calendarStatusConfig[hoveredLeave.leave.durum]?.bg} ${calendarStatusConfig[hoveredLeave.leave.durum]?.text}`}>{hoveredLeave.leave.durum}</span>
                          </div>
                          <p className="text-sm text-zinc-400">{hoveredLeave.leave.izinTuru} &middot; {hoveredLeave.leave.baslangicTarihi} – {hoveredLeave.leave.bitisTarihi}</p>
                          {hoveredLeave.leave.neden && <p className="text-xs text-zinc-500 mt-2 italic">"{hoveredLeave.leave.neden}"</p>}
                        </div>
                        <button onClick={() => setHoveredLeave(null)} className="text-zinc-600 hover:text-zinc-300 text-lg font-bold leading-none p-1">×</button>
                      </div>
                    )}
                  </div>
                )}

                {currentTab === 'izin' && leaveView === 'list' && filterData(izinler).map(i => (
                  <div key={i.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-base font-semibold text-zinc-100">{i.personel?.firstName} {i.personel?.lastName}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          i.durum === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          i.durum === 'Yönetici Onayladı' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                          i.durum === 'Reddedildi' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {i.durum === 'Yönetici Onayladı' ? tr('Manager Approved - Waiting for Admin', 'Yönetici Onayladı - Admin Bekliyor') : tr(i.durum, i.durum)}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 mb-4 bg-zinc-950 p-2 rounded-md border border-zinc-800">{i.izinTuru} &middot; {i.baslangicTarihi} - {i.bitisTarihi}</div>
                      <p className="text-sm text-zinc-300 leading-relaxed mb-6 line-clamp-3">{i.neden}</p>
                    </div>
                    <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800/50">
                      <Button 
                        className="h-9 text-xs w-full" 
                        variant="outline" 
                        onClick={() => {
                          if (i.durum === 'Onaylandı') {
                            generateLeaveRequestPDF(i);
                            showNotification(tr('PDF successfully downloaded.', 'PDF başarıyla indirildi.'), 'success');
                          } else {
                            showNotification(tr('Manager/Admin approval required to download PDF.', 'PDF indirmek için yönetici veya admin onayı gereklidir.'), 'error');
                          }
                        }}
                      >
                        {tr('Download PDF', 'PDF İndir')}
                      </Button>

                      {/* Çok Aşamalı Onay Butonları */}
                      {(
                         (isAdmin && (i.durum === 'Beklemede' || i.durum === 'Yönetici Onayladı')) ||
                         (isManager && i.durum === 'Beklemede' && i.personel?.departman?.id === myDepId)
                      ) && (
                        <div className="grid grid-cols-2 gap-3">
                          <Button className="h-9 text-xs" variant="success" onClick={() => handleAction('put', `/users/izin-onay/${i.id}`, { durum: 'Onaylandı' }, tr('Approved', 'Onaylandı'))}>
                            {i.durum === 'Yönetici Onayladı' ? tr('Final Approve', 'Kesin Onayla') : tr('Approve', 'Onayla')}
                          </Button>
                          <Button className="h-9 text-xs" variant="outline" onClick={() => handleAction('put', `/users/izin-onay/${i.id}`, { durum: 'Reddedildi' }, tr('Declined', 'Reddedildi'))}>{tr('Decline', 'Reddet')}</Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {currentTab === 'izin' && leaveView === 'list' && filterData(izinler).length === 0 && <div className="col-span-full"><EmptyState message={tr("No pending leave requests.", "İzin talebi yok.")} icon={CalendarClock} /></div>}

                {currentTab === 'zimmet' && filterData(zimmetler).map(z => (
                  <div key={z.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex flex-col">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-lg flex items-center justify-center text-indigo-500 mb-4 border border-indigo-500/20"><Building className="w-5 h-5" /></div>
                    <h4 className="text-base font-semibold text-zinc-100 mb-1">{z.esyaAdi}</h4>
                    <p className="text-xs font-mono text-zinc-500 mb-4">S/N: {z.seriNo}</p>
                    <div className="mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{tr('Assigned:', 'Emanet Alıcı:')} {z.personel?.firstName} {z.personel?.lastName}</span>
                      {(isAdmin || currentUser?.canManageInventory) && <button onClick={() => handleAction('delete', `/users/zimmet-teslim-al/${z.id}`)} className="text-red-500 hover:text-red-400 font-medium">{tr('Revoke', 'Geri Al')}</button>}
                    </div>
                  </div>
                ))}
                {currentTab === 'zimmet' && filterData(zimmetler).length === 0 && <div className="col-span-full"><EmptyState message={tr("No allocated operational assets.", "Zimmetlenmiş eşya bulunamadı.")} icon={FolderOpen} /></div>}

                {currentTab === 'belgeler' && filterData(docs).map(dc => (
                  <div key={dc.id} className="bg-zinc-900 p-5 rounded-xl border border-zinc-800 flex items-center gap-4 hover:border-zinc-700 transition-colors shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{dc.dosyaAdi}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{dc.dosyaTuru} &middot; {dc.personel?.firstName}</p>
                    </div>
                    {dc.dosyaIcerik && <a href={dc.dosyaIcerik} download={dc.dosyaAdi} className="p-2 text-indigo-400 hover:bg-zinc-800 rounded-md transition-colors"><AlertCircle className="w-4 h-4" /></a>}
                  </div>
                ))}
                {currentTab === 'belgeler' && filterData(docs).length === 0 && <div className="col-span-full"><EmptyState message={tr("No documents stored in the system vault.", "Sistemde belge kaydı yok.")} icon={FolderOpen} /></div>}

                {currentTab === 'departman' && departmanlar.map(d => (
                  <div key={d.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex flex-col">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/10 flex items-center justify-center mb-4 border border-indigo-500/20 text-indigo-400"><Building className="w-5 h-5" /></div>
                    <h4 className="text-lg font-semibold text-zinc-100 mb-2">{d.ad}</h4>
                    <div className="text-xs font-medium text-zinc-500 mt-auto pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                      <span>{tr('Staff Count:', 'Çalışan Sayısı:')} {d.personeller?.length || 0}</span>
                      {(isAdmin || currentUser?.canManagePersonnel) && <button onClick={() => handleAction('delete', `/users/departman-sil/${d.id}`, {}, tr("Department Deleted", "Bağlantı Kesildi"))} className="text-red-500 hover:text-red-400">{tr('Delete', 'Kaldır')}</button>}
                    </div>
                  </div>
                ))}
                {currentTab === 'departman' && departmanlar.length === 0 && <div className="col-span-full"><EmptyState message={tr("No active departments configured.", "Açık bir departman yok.")} icon={Building} /></div>}

                {currentTab === 'duyuru_arşiv' && duyurular.map(dy => (
                  <div key={dy.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-base font-semibold text-indigo-400 shrink-0 pr-4">{dy.baslik}</h4>
                      <span className="text-xs text-zinc-500 tabular-nums whitespace-nowrap">{dy.tarih}</span>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed mb-6">{dy.icerik}</p>
                    <div className="flex justify-between items-center text-xs pt-4 border-t border-zinc-800/50">
                      <span className="text-zinc-500 flex items-center"><AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {tr('Published by:', 'Yayınlayan:')} {dy.yapanKisi}</span>
                      {isAdmin && <button onClick={() => handleAction('delete', `/users/duyuru-sil/${dy.id}`, {}, tr("Announcement Archived", "Duyuru Yayından Alındı"))} className="text-red-500 hover:text-red-400 font-medium">{tr('Remove', 'Kaldır')}</button>}
                    </div>
                  </div>
                ))}
                {currentTab === 'duyuru_arşiv' && duyurular.length === 0 && <div className="col-span-full"><EmptyState message={tr("No company announcements active.", "Şirket içi güncel duyuru yok.")} icon={AlertCircle} /></div>}

                {currentTab === 'trash' && (() => {
                  const [trashSearch, setTrashSearch] = [searchTerm, setSearchTerm];
                  const typeColors = {
                    'Personel': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
                    'Görev': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    'Duyuru': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                    'Zimmet': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                    'Belge': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    'Harcama': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
                    'Departman': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
                  };
                  const filtered = recycleBin.filter(r => {
                    const search = (trashSearch || '').toLowerCase();
                    return (
                      (r.itemTitle || r.silinenVeriTxt || '').toLowerCase().includes(search) ||
                      (r.itemType || r.tabloAdi || '').toLowerCase().includes(search) ||
                      (r.deletedBy || '').toLowerCase().includes(search)
                    );
                  });

                  const toggleSelect = (id) => {
                    setSelectedTrashItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
                  };

                  const handleBulkAction = async (action) => {
                    if (selectedTrashItems.length === 0) return;
                    const confirmMsg = action === 'delete' 
                      ? tr('Are you sure you want to permanently delete selected items?', 'Seçili kayıtları kalıcı olarak silmek istediğinize emin misiniz?')
                      : tr('Are you sure you want to restore selected items?', 'Seçili kayıtları geri yüklemek istediğinize emin misiniz?');
                    
                    if (window.confirm(confirmMsg)) {
                      await handleAction('post', '/users/recycle-bulk-action', { ids: selectedTrashItems, action }, tr('Bulk action completed.', 'Toplu işlem başarıyla tamamlandı.'));
                      setSelectedTrashItems([]);
                    }
                  };

                  return (
                    <>
                      {/* Trash Header */}
                      <div className="col-span-full bg-zinc-900 border border-red-500/20 rounded-2xl p-5 mb-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {recycleBin.length > 0 && (
                            <input 
                              type="checkbox" 
                              checked={selectedTrashItems.length === filtered.length && filtered.length > 0} 
                              onChange={() => {
                                if (selectedTrashItems.length === filtered.length) setSelectedTrashItems([]);
                                else setSelectedTrashItems(filtered.map(f => f.id));
                              }}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          )}
                          <div>
                            <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2"><Trash2 className="w-5 h-5 text-red-500" />{tr('Recycle Bin', 'Geri Dönüşüm Kutusu')}</h2>
                            <p className="text-xs text-zinc-500 mt-1">{recycleBin.length} {tr('deleted record(s).', 'silinen kayıt.')}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                          {selectedTrashItems.length > 0 && (
                            <div className="flex items-center gap-2 pr-4 border-r border-zinc-800 mr-2">
                              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{selectedTrashItems.length} {tr('Selected', 'Seçili')}</span>
                              <button onClick={() => handleBulkAction('restore')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors" title={tr('Restore Selected', 'Seçilenleri Geri Yükle')}>
                                <Activity className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleBulkAction('delete')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" title={tr('Delete Selected Permanently', 'Seçilenleri Kalıcı Sil')}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={tr('Search...', 'Ara...')}
                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500 transition-all min-w-[200px]"
                          />
                          
                          <Button 
                            variant="outline" 
                            className="h-9 text-[10px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => {
                              if(window.confirm(tr('Empty entire recycle bin?', 'Tüm çöp kutusunu kalıcı olarak boşaltmak istiyor musunuz?'))) {
                                handleAction('post', '/users/recycle-empty', {}, tr('Recycle bin cleared.', 'Çöp kutusu temizlendi.'));
                              }
                            }}
                          >
                            {tr('Empty Trash', 'Tümünü Sil')}
                          </Button>
                        </div>
                      </div>

                      {filtered.length === 0 && (
                        <div className="col-span-full"><EmptyState message={recycleBin.length === 0 ? tr('Recycle bin is empty.', 'Çöp kutusu boş.') : tr('No match found.', 'Sonuç bulunamadı.')} icon={Trash2} /></div>
                      )}

                      {filtered.map(r => {
                        const typeName = r.itemType || r.tabloAdi || 'Bilinmiyor';
                        const title = r.itemTitle || r.silinenVeriTxt || '-';
                        const deletedAt = r.deletedAt || r.silinmeTarihi || '-';
                        const deletedBy = r.deletedBy || '-';
                        const colorClass = typeColors[typeName] || 'text-zinc-400 bg-zinc-800 border-zinc-700';
                        const isSelected = selectedTrashItems.includes(r.id);

                        return (
                          <div key={r.id} className={`bg-zinc-900 border ${isSelected ? 'border-indigo-500/50 ring-1 ring-indigo-500/20' : 'border-red-500/10'} rounded-xl shadow-sm flex flex-col overflow-hidden hover:border-zinc-700 transition-all group relative`}>
                            <div className="absolute top-4 left-4 z-10">
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                onChange={() => toggleSelect(r.id)}
                                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer shadow-sm"
                              />
                            </div>

                            {/* Card Header */}
                            <div className="px-5 pt-5 pb-3 border-b border-zinc-800/50 pl-12">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-widest flex items-center gap-1 ${colorClass}`}>
                                  <Trash2 className="w-3 h-3" />{typeName}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono tabular-nums whitespace-nowrap">{deletedAt}</span>
                              </div>
                              <h3 className="text-sm font-bold text-zinc-100 truncate">{title}</h3>
                            </div>
                            {/* Card Body */}
                            <div className="px-5 py-3 flex items-center gap-2 text-[11px] text-zinc-500 pl-12">
                              <span className="font-medium text-zinc-400">{tr('Deleted by:', 'Silen:')}</span>
                              <span className="font-semibold text-zinc-300">{deletedBy}</span>
                            </div>
                            {/* Actions */}
                            <div className="px-5 pb-5 mt-auto grid grid-cols-2 gap-2">
                              <Button variant="outline" onClick={() => handleAction('post', `/users/recycle-restore/${r.id}`, {}, tr('Data restored', 'Geri yüklendi'))} className="h-8 text-[10px] border-zinc-800 hover:border-emerald-500/30 hover:text-emerald-400">
                                {tr('Restore', 'Geri Yükle')}
                              </Button>
                              <Button variant="outline" onClick={() => {
                                if(window.confirm(tr('Delete permanently?', 'Kalıcı olarak silmek istediğinize emin misiniz?'))) {
                                  handleAction('delete', `/users/recycle-delete/${r.id}`, {}, tr('Permanently deleted', 'Kalıcı olarak silindi'));
                                }
                              }} className="h-8 text-[10px] border-zinc-800 hover:border-red-500/30 hover:text-red-400">
                                {tr('Delete', 'Kalıcı Sil')}
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  );
                })()}

              </div>

              {currentTab === 'performans' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-10 h-full">
                  {isAdmin && (
                    <div className="bg-zinc-900 p-6 md:p-8 rounded-xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                      <div>
                        <h3 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">Cognitive Analyst</h3>
                        <p className="text-sm text-zinc-500 mt-1">{tr('Measure staff performance matrices and bottlenecks via AI', 'Ölçülebilir yapay zeka ile personel potansiyeli')}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <Select value={selectedAiUser} onChange={e => setSelectedAiUser(e.target.value)} className="w-[200px] h-10">
                          <option value="">{tr('Select Employee...', 'Personel Seç...')}</option>
                          {filterData(personeller, true).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
                        </Select>
                        <Button variant="ai" className="h-10 px-6 shrink-0" onClick={() => handleAction('post', `/users/performance/ai-evaluate/${selectedAiUser}`, {}, tr("Analysis Generated", "Rapor Çıkarıldı"))}>{tr('Run AI Report', 'Analiz Et')}</Button>
                      </div>
                    </div>
                  )}

                  {/* 📈 PERFORMANCE TREND CHART */}
                  <div className="bg-zinc-900/40 p-6 rounded-xl border border-zinc-800/50 shadow-inner">
                    <h4 className="text-sm font-semibold text-zinc-400 mb-6 uppercase tracking-wider">{tr('Performance Evolution (Last 10 Cycles)', 'Performans Gelişim Çizgisi (Son 10 Dönem)')}</h4>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={performances.filter(p => !selectedAiUser || p.personel?.id === Number(selectedAiUser)).slice(-10)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                          <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                          <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px' }} />
                          <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#09090b' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filterData(performances).map(pf => (
                      <div key={pf.id} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className="text-lg font-semibold text-zinc-100">{pf.personel?.firstName} {pf.personel?.lastName}</p>
                            <span className="inline-block px-2 py-1 mt-2 text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 rounded-md border border-indigo-500/20">{pf.badge}</span>
                          </div>
                          <div className="text-2xl font-bold text-zinc-100">{pf.score}<span className="text-sm text-zinc-500 font-normal">/100</span></div>
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed p-4 rounded-lg bg-zinc-950 border border-zinc-800">"{pf.aiSummary}"</p>
                        <p className="text-xs text-zinc-500 mt-6 pt-4 border-t border-zinc-800 font-mono">{pf.date} &middot; Output by {pf.evaluator}</p>
                      </div>
                    ))}
                    {performances.length === 0 && <div className="col-span-full"><EmptyState message={tr("No AI analysis metrics run yet.", "Hiç değerlendirme yapılmadı.")} icon={AlertCircle} /></div>}
                  </div>
                </div>
              )}

              {currentTab === 'onboarding' && (
                <div className="col-span-full space-y-8 animate-in slide-in-from-bottom-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 shadow-sm">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">{tr('Onboarding / Offboarding Center', 'İşe Giriş / Çıkış Merkezi')}</h3>
                      <p className="text-sm text-zinc-500 mt-1">{tr('Manage critical tasks for staff transitions.', 'Personel geçiş süreçlerindeki kritik adımları yönetin.')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     {/* ONBOARDING SECTION */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-2"><ClipboardList className="w-4 h-4" /> {tr('Onboarding (New Staff)', 'İşe Giriş (Onboarding)')}</h4>
                           <span className="text-[10px] text-zinc-500 font-mono italic">{checklists.filter(c => c.tip === 'ONBOARDING' && c.tamamlandi).length} / {checklists.filter(c => c.tip === 'ONBOARDING').length} {tr('Done', 'Tamamlandı')}</span>
                        </div>
                        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800/50 shadow-lg">
                           {checklists.filter(c => c.tip === 'ONBOARDING').map(item => (
                             <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                   <input 
                                     type="checkbox" 
                                     checked={item.tamamlandi} 
                                     onChange={() => currentUser?.canManagePersonnel && handleAction('put', `/users/checklist-guncelle/${item.id}`, { tamamlandi: !item.tamamlandi })}
                                     className={`w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 transition-all ${currentUser?.canManagePersonnel ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                     disabled={!currentUser?.canManagePersonnel}
                                   />
                                   <div>
                                      <p className={`text-sm font-medium transition-all ${item.tamamlandi ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{item.baslik}</p>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.personel?.firstName} {item.personel?.lastName} &middot; {item.tarih}</p>
                                   </div>
                                </div>
                                <button onClick={() => handleAction('delete', `/users/checklist-sil/${item.id}`)} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                           ))}
                           <div className="p-4 bg-zinc-900/50">
                              <form className="flex gap-2" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                const baslik = fd.get('baslik');
                                const pid = fd.get('personelId');
                                if (!baslik || !pid) return;
                                handleAction('post', '/users/checklist-ekle', { baslik, personelId: pid, tip: 'ONBOARDING' });
                                e.target.reset();
                              }}>
                                 <Select name="personelId" className="flex-1 min-w-[120px] text-xs h-9">
                                    <option value="">{tr('Employee...', 'Personel...')}</option>
                                    {personeller.map(p => <option key={p.id} value={p.id}>{p.firstName}</option>)}
                                 </Select>
                                 <input name="baslik" className="flex-[2] bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-indigo-500 transition-all" placeholder={tr('New onboarding task...', 'Yeni görev...')} required />
                                 {currentUser?.canManagePersonnel && <Button type="submit" className="px-4 text-xs h-9" variant="success">+</Button>}
                              </form>
                           </div>
                        </div>
                     </div>

                     {/* OFFBOARDING SECTION */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                           <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest flex items-center gap-2"><Trash2 className="w-4 h-4" /> {tr('Offboarding (Exits)', 'İşten Ayrılış (Offboarding)')}</h4>
                           <span className="text-[10px] text-zinc-500 font-mono italic">{checklists.filter(c => c.tip === 'OFFBOARDING' && c.tamamlandi).length} / {checklists.filter(c => c.tip === 'OFFBOARDING').length} {tr('Done', 'Tamamlandı')}</span>
                        </div>
                        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden divide-y divide-zinc-800/50 shadow-lg">
                           {checklists.filter(c => c.tip === 'OFFBOARDING').map(item => (
                             <div key={item.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                   <input 
                                     type="checkbox" 
                                     checked={item.tamamlandi} 
                                     onChange={() => currentUser?.canManagePersonnel && handleAction('put', `/users/checklist-guncelle/${item.id}`, { tamamlandi: !item.tamamlandi })}
                                     className={`w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-500 transition-all ${currentUser?.canManagePersonnel ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                     disabled={!currentUser?.canManagePersonnel}
                                   />
                                   <div>
                                      <p className={`text-sm font-medium transition-all ${item.tamamlandi ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>{item.baslik}</p>
                                      <p className="text-[10px] text-zinc-500 mt-0.5">{item.personel?.firstName} {item.personel?.lastName} &middot; {item.tarih}</p>
                                   </div>
                                </div>
                                <button onClick={() => handleAction('delete', `/users/checklist-sil/${item.id}`)} className="text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5"><Trash2 className="w-3.5 h-3.5" /></button>
                             </div>
                           ))}
                           <div className="p-4 bg-zinc-900/50">
                              <form className="flex gap-2" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.target);
                                const baslik = fd.get('baslik');
                                const pid = fd.get('personelId');
                                if (!baslik || !pid) return;
                                handleAction('post', '/users/checklist-ekle', { baslik, personelId: pid, tip: 'OFFBOARDING' });
                                e.target.reset();
                              }}>
                                 <Select name="personelId" className="flex-1 min-w-[120px] text-xs h-9">
                                    <option value="">{tr('Employee...', 'Personel...')}</option>
                                    {personeller.map(p => <option key={p.id} value={p.id}>{p.firstName}</option>)}
                                 </Select>
                                 <input name="baslik" className="flex-[2] bg-zinc-950 border border-zinc-800 rounded-md px-3 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-red-500 transition-all" placeholder={tr('New offboarding task...', 'İşten çıkış adımı...')} required />
                                 {currentUser?.canManagePersonnel && <Button type="submit" className="px-4 text-xs h-9" variant="outline">-</Button>}
                              </form>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoggedIn && currentTab === 'mail' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-6 p-6">
              <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                     <Send className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-100">{tr('Email Center', 'E-Posta Merkezi')}</h3>
                    <p className="text-sm text-zinc-500 mt-1">{tr('Send announcements or specific alerts to personnel.', 'Personellere toplu veya tekil e-posta gönderin.')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Personel Listesi (Sol) */}
                <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[600px] overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
                     <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{tr('Recipient List', 'Alıcı Listesi')}</h4>
                     <button onClick={() => {
                       if(selectedMailUsers.length === personeller.length) setSelectedMailUsers([]);
                       else setSelectedMailUsers(personeller.map(p => p.id));
                     }} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase">{selectedMailUsers.length === personeller.length ? tr('Deselect All', 'Temizle') : tr('Select All', 'Hepsini Seç')}</button>
                  </div>
                  <div className="p-4 border-b border-zinc-800">
                     <input 
                       className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 transition-all text-zinc-100 placeholder-zinc-700" 
                       placeholder={tr('Search personnel...', 'Personel ara...')}
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                     />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filterData(personeller, true).map(p => (
                      <div 
                        key={p.id} 
                        onClick={() => {
                          setSelectedMailUsers(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]);
                        }}
                        className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selectedMailUsers.includes(p.id) ? 'bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'bg-zinc-950 border-zinc-800/50 hover:border-zinc-700'}`}
                      >
                         <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedMailUsers.includes(p.id) ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-900 border-zinc-700'}`}>
                           {selectedMailUsers.includes(p.id) && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-xs font-bold text-zinc-200 truncate">{p.firstName} {p.lastName}</p>
                           <p className="text-[10px] text-zinc-500 truncate">{p.email}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 text-[10px] text-zinc-500 font-medium">
                    {selectedMailUsers.length} {tr('personnel selected.', 'personel seçildi.')}
                  </div>
                </div>

                {/* Mail Formu (Sağ) */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 space-y-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{tr('Subject', 'E-Posta Konusu')}</label>
                         <input 
                           value={mailSubject}
                           onChange={e => setMailSubject(e.target.value)}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100" 
                           placeholder={tr('Enter subject...', 'Konu başlığını girin...')}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{tr('Message', 'Mesaj İçeriği')}</label>
                         <textarea 
                           rows="12"
                           value={mailContent}
                           onChange={e => setMailContent(e.target.value)}
                           className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-zinc-100 resize-none" 
                           placeholder={tr('Type your message here...', 'Mesajınızı buraya yazın...')}
                         />
                      </div>
                      <div className="pt-4 flex justify-end">
                         <Button 
                           className="px-8 py-3" 
                           variant="ai"
                           disabled={selectedMailUsers.length === 0 || !mailSubject || !mailContent}
                           onClick={() => {
                             handleAction('post', '/users/send-custom-email', { userIds: selectedMailUsers, subject: mailSubject, message: mailContent }, tr('Emails are being sent.', 'E-Postalar gönderiliyor.'));
                             setMailSubject('');
                             setMailContent('');
                             setSelectedMailUsers([]);
                           }}
                         >
                           <Send className="w-4 h-4 mr-2" />
                           {tr('Send Emails', 'E-Postaları Gönder')}
                         </Button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ChatDock
          chatOpen={chatOpen} setChatOpen={setChatOpen}
          chatTab={chatTab} setChatTab={setChatTab}
          aiChat={aiChat} chatMessages={chatMessages}
          currentUser={currentUser} chatInput={chatInput}
          setChatInput={setChatInput} sendMessage={sendMessage}
          chatEndRef={chatEndRef} lang={lang}
        />

        <Drawer
          showAddDrawer={showAddDrawer} setShowAddDrawer={setShowAddDrawer}
          drawerType={drawerType} setDrawerType={setDrawerType}
          isManager={isManager} isAdmin={isAdmin} departmanlar={departmanlar} personeller={personeller} currentUser={currentUser}
          pForm={pForm} setPForm={setPForm}
          dForm={dForm} setDForm={setDForm}
          mForm={mForm} setMForm={setMForm}
          iForm={iForm} setIForm={setIForm}
          mesaiForm={mesaiForm} setMesaiForm={setMesaiForm}
          duyuruForm={duyuruForm} setDuyuruForm={setDuyuruForm}
          zForm={zForm} setZForm={setZForm}
          taskForm={taskForm} setTaskForm={setTaskForm}
          expForm={expForm} setExpForm={setExpForm}
          docForm={docForm} setDocForm={setDocForm}
          handleAction={handleAction}
          showNotification={showNotification} lang={lang}
        />

        <EditModal
          editingItem={editingItem} setEditingItem={setEditingItem}
          departmanlar={departmanlar} maaslar={maaslar} izinler={izinler}
          isAdmin={isAdmin} handleAction={handleAction} lang={lang}
        />

        {selectedLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
              <header className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-500">
                     <ScrollText className="w-5 h-5" />
                   </div>
                   <div>
                     <h2 className="text-lg font-semibold text-zinc-100">{tr('Log Payload Details', 'İşlem Verisi Detayı')}</h2>
                     <p className="text-xs text-zinc-500 mt-0.5">{selectedLog.islem} &middot; {selectedLog.tarih}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded-md">
                   <Trash2 className="w-5 h-5 rotate-45" />
                </button>
              </header>
              <div className="flex-1 overflow-auto bg-zinc-900 p-4 rounded-lg border border-zinc-800 font-mono text-xs leading-relaxed custom-scrollbar text-zinc-300">
                 {selectedLog.entityName && (
                   <div className="mb-4 pb-4 border-b border-zinc-800/50">
                     <span className="font-bold text-indigo-400">TARGET:</span> {selectedLog.entityName} (ID: {selectedLog.entityId || 'N/A'})
                   </div>
                 )}
                 {selectedLog.oldData && (
                   <div className="mb-4">
                     <div className="text-red-400 font-bold mb-1">OLD DATA:</div>
                     <pre className="text-red-300/80 bg-red-950/20 p-2 rounded border border-red-900/30">
                       {(() => { try { return JSON.stringify(JSON.parse(selectedLog.oldData), null, 2); } catch { return selectedLog.oldData; }})()}
                     </pre>
                   </div>
                 )}
                 {selectedLog.newData && (
                   <div className="mb-4">
                     <div className="text-emerald-400 font-bold mb-1">NEW DATA:</div>
                     <pre className="text-emerald-300/80 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                       {(() => { try { return JSON.stringify(JSON.parse(selectedLog.newData), null, 2); } catch { return selectedLog.newData; }})()}
                     </pre>
                   </div>
                 )}
                 <div className="text-zinc-500 font-bold mb-1">PAYLOAD:</div>
                 <pre className="text-emerald-500 whitespace-pre-wrap break-all">
                   {(() => {
                      try { return JSON.stringify(JSON.parse(selectedLog.payload || '{}'), null, 2); }
                      catch(e) { return selectedLog.payload || tr('No data.', 'Veri yok.'); }
                   })()}
                 </pre>
              </div>
              <footer className="mt-6 pt-4 border-t border-zinc-800 text-right">
                <Button onClick={() => setSelectedLog(null)}>{tr('Close', 'Kapat')}</Button>
              </footer>
            </div>
          </div>
        )}

      </main>
    </div>
  );

  async function yetkiGuncelle(userId) {
    const unvan = document.getElementById(`unvan-${userId}`).value;
    const departmanId = document.getElementById(`dep-${userId}`).value;
    const role = document.getElementById(`role-${userId}`).value;
    const canManagePersonnel = document.getElementById(`prm-p-${userId}`).checked;
    const canManageFinance = document.getElementById(`prm-f-${userId}`).checked;
    const canApproveLeaves = document.getElementById(`prm-l-${userId}`).checked;
    const canManageInventory = document.getElementById(`prm-i-${userId}`).checked;

    await handleAction('put', `/users/personel-guncelle/${userId}`, { 
      unvan,
      departmanId, 
      role, 
      canManagePersonnel, 
      canManageFinance, 
      canApproveLeaves, 
      canManageInventory 
    }, tr("Auth Updated Successfully", "Yetki Ayarlandı"));
  }
}

export default App;

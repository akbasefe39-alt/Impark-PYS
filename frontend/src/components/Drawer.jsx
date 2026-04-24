import React from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { X, Users, CalendarClock, Building, HandCoins } from 'lucide-react';
import { getDict } from '../utils';

const Drawer = ({
  showAddDrawer, setShowAddDrawer, drawerType, setDrawerType,
  isManager, isAdmin, departmanlar, personeller = [], currentUser,
  pForm, setPForm, dForm, setDForm, mForm, setMForm, iForm, setIForm,
  mesaiForm, setMesaiForm, duyuruForm, setDuyuruForm, zForm, setZForm,
  taskForm, setTaskForm, expForm, setExpForm, docForm, setDocForm,
  handleAction, showNotification, lang
}) => {
  if (!showAddDrawer) return null;
  const tr = getDict(lang);

  return (
    <div className="fixed inset-0 z-[500] flex animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddDrawer(false)}></div>
      <div className="relative ml-auto w-full max-w-xl bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-zinc-800 animate-in slide-in-from-right-full duration-300">
        <header className="h-16 bg-zinc-900 flex justify-between items-center px-6 border-b border-zinc-800 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-100">{tr('Data Entry Portal', 'Veri Girişi')}</h2>
          <button onClick={() => setShowAddDrawer(false)} className="text-zinc-400 hover:text-zinc-100 transition-colors p-2"><X className="w-5 h-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">{tr('Active Module', 'İşlem Türü')}</label>
            <Select value={drawerType} onChange={e => setDrawerType(e.target.value)}>
              <option value="izin">{tr('Leave Request', 'İzin Talebi')}</option><option value="harcama">{tr('Expense Declaration', 'Harcama Girişi')}</option><option value="mesai">{tr('Attendance / Timesheet', 'Mesai Ekle')}</option>
              {isManager && <option value="gorev">{tr('Task Assignment', 'Görev Ata')}</option>}
              {isAdmin && <><option value="personel">{tr('New Staff Record', 'Yeni Personel')}</option><option value="departman">{tr('Create Department', 'Yeni Departman')}</option><option value="maas">{tr('Payroll Entry', 'Maaş Bordrosu')}</option><option value="zimmet">{tr('Asset Assignment', 'Zimmet Ver')}</option></>}
              <option value="belge">{tr('Document Upload', 'Belge Ekle')}</option>
              {isManager && <option value="duyuru">{tr('Publish Announcement', 'Duyuru Yayınla')}</option>}
            </Select>
          </div>
          <hr className="border-t border-zinc-800" />

          {drawerType === 'personel' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{tr('Identity', 'Kimlik Bilgileri')}</div>
              <div className="grid grid-cols-2 gap-4"><Input value={pForm.firstName} placeholder={tr("First Name", "İsim")} onChange={e => setPForm({ ...pForm, firstName: e.target.value })} /><Input value={pForm.lastName} placeholder={tr("Last Name", "Soyisim")} onChange={e => setPForm({ ...pForm, lastName: e.target.value })} /></div>
              <Input value={pForm.tcKimlikNo || ''} placeholder={tr("National ID (TC)", "TC Kimlik No")} onChange={e => setPForm({ ...pForm, tcKimlikNo: e.target.value })} />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Birth Date', 'Doğum Tarihi')}</label><Input type="date" value={pForm.dogumTarihi || ''} onChange={e => setPForm({ ...pForm, dogumTarihi: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Gender', 'Cinsiyet')}</label><Select value={pForm.cinsiyet || ''} onChange={e => setPForm({ ...pForm, cinsiyet: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option value="Erkek">{tr('Male', 'Erkek')}</option><option value="Kadın">{tr('Female', 'Kadın')}</option></Select></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Nationality', 'Uyruk')}</label><Select value={pForm.uyruk || 'TC'} onChange={e => setPForm({ ...pForm, uyruk: e.target.value })}><option value="TC">T.C.</option><option value="KKTC">KKTC</option><option value="Çifte Vatandaş">Çifte Vatandaş</option><option value="Yabancı">Yabancı Uyruk</option></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Marital Status', 'Medeni Hal')}</label><Select value={pForm.medeniHal || ''} onChange={e => setPForm({ ...pForm, medeniHal: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option value="Bekar">{tr('Single', 'Bekar')}</option><option value="Evli">{tr('Married', 'Evli')}</option></Select></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Blood Type', 'Kan Grubu')}</label><Select value={pForm.kanGrubu || ''} onChange={e => setPForm({ ...pForm, kanGrubu: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>0+</option><option>0-</option><option>AB+</option><option>AB-</option></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Education', 'Eğitim Durumu')}</label><Select value={pForm.mezuniyet || ''} onChange={e => setPForm({ ...pForm, mezuniyet: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option value="İlkokul">İlkokul</option><option value="Ortaokul">Ortaokul</option><option value="Lise">Lise</option><option value="Üniversite">Üniversite</option><option value="Yüksek Lisans">Yüksek Lisans</option></Select></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Military Status', 'Askerlik')}</label><Select value={pForm.askerlikDurumu || ''} onChange={e => setPForm({ ...pForm, askerlikDurumu: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option value="Yapıldı">Yapıldı</option><option value="Tecilli">Tecilli</option><option value="Muaf">Muaf</option></Select></div>
              </div>
              <hr className="border-t border-zinc-800" />
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{tr('Contact', 'İletişim')}</div>
              <Input value={pForm.email} placeholder={tr("Corporate Email", "Kurumsal E-Posta")} onChange={e => setPForm({ ...pForm, email: e.target.value })} />
              <Input value={pForm.password} type="password" placeholder={tr("Temporary Password", "Geçici Şifre")} onChange={e => setPForm({ ...pForm, password: e.target.value })} />
              <Input value={pForm.telefon || ''} placeholder={tr("Phone", "Telefon")} onChange={e => setPForm({ ...pForm, telefon: e.target.value })} />
              <Input value={pForm.adres || ''} placeholder={tr("Address", "Adres")} onChange={e => setPForm({ ...pForm, adres: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input value={pForm.acilDurumKisisi || ''} placeholder={tr("Emergency Contact", "Acil Durum Kişisi")} onChange={e => setPForm({ ...pForm, acilDurumKisisi: e.target.value })} />
                <Input value={pForm.acilDurumTelefonu || ''} placeholder={tr("Emergency Phone", "Acil Durum Tel")} onChange={e => setPForm({ ...pForm, acilDurumTelefonu: e.target.value })} />
              </div>
              <hr className="border-t border-zinc-800" />
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{tr('Employment', 'İş Bilgileri')}</div>
              <Input value={pForm.unvan} placeholder={tr("Job Title", "Ünvan (Ör: Yazılım Uzmanı)")} onChange={e => setPForm({ ...pForm, unvan: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Select value={pForm.departmanId} onChange={e => setPForm({ ...pForm, departmanId: e.target.value })}><option value="">{tr('Department...', 'Birim...')}</option>{departmanlar.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}</Select>
                <Select value={pForm.role} onChange={e => setPForm({ ...pForm, role: e.target.value })}><option value="personel">{tr('Staff', 'Personel')}</option><option value="yonetici">{tr('Manager', 'Yönetici')}</option><option value="admin">Admin</option></Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Start Date', 'İşe Başlama')}</label><Input value={pForm.iseGirisTarihi} type="date" onChange={e => setPForm({ ...pForm, iseGirisTarihi: e.target.value })} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Contract', 'Sözleşme')}</label><Select value={pForm.sozlesmeTipi || ''} onChange={e => setPForm({ ...pForm, sozlesmeTipi: e.target.value })}><option value="">{tr('Select', 'Seçin')}</option><option value="Belirsiz Süreli">Belirsiz Süreli</option><option value="Belirli Süreli">Belirli Süreli</option><option value="Yarı Zamanlı">Yarı Zamanlı</option><option value="Stajyer">Stajyer</option></Select></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">{tr("Driver's License", 'Ehliyet Sınıfları')}</label>
                <div className="flex flex-wrap gap-2">
                  {['M','A1','A2','A','B1','B','BE','C1','C1E','C','CE','D1','D1E','D','DE','F','G'].map(cls => {
                    const selected = (pForm.ehliyetSinifi || '').split(',').filter(Boolean);
                    const isChecked = selected.includes(cls);
                    return <button key={cls} type="button" onClick={() => { const next = isChecked ? selected.filter(c => c !== cls) : [...selected, cls]; setPForm({ ...pForm, ehliyetSinifi: next.join(',') }); }} className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>{cls}</button>;
                  })}
                </div>
              </div>

              <hr className="border-t border-zinc-800" />
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{tr('Finance', 'Finans & Yasal')}</div>
              <div className="grid grid-cols-3 gap-4"><div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Hours', 'Mesai')}</label><Input type="number" value={pForm.normalCalismaSaati} onChange={e => setPForm({ ...pForm, normalCalismaSaati: Number(e.target.value) })} /></div><div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Hourly ₺', 'Saatlik')}</label><Input type="number" value={pForm.saatlikUcret} onChange={e => setPForm({ ...pForm, saatlikUcret: Number(e.target.value) })} /></div><div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Daily ₺', 'Günlük')}</label><Input type="number" value={pForm.gunlukUcret} onChange={e => setPForm({ ...pForm, gunlukUcret: Number(e.target.value) })} /></div></div>
              <Input value={pForm.sgkNo || ''} placeholder={tr("SSI Number (SGK)", "SGK Sicil No")} onChange={e => setPForm({ ...pForm, sgkNo: e.target.value })} />
              <Input value={pForm.vergiNo || ''} placeholder={tr("Tax ID", "Vergi Dairesi / No")} onChange={e => setPForm({ ...pForm, vergiNo: e.target.value })} />
              <Input value={pForm.iban || ''} placeholder={tr("IBAN", "IBAN (Maaş Hesabı)")} onChange={e => setPForm({ ...pForm, iban: e.target.value })} />
              <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                <span className="text-sm font-medium text-zinc-300">{tr('Can View Dashboard', 'Özet Paneli Görüntüleyebilir')}</span>
                <button type="button" onClick={() => setPForm({ ...pForm, canViewDashboard: !pForm.canViewDashboard })} className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pForm.canViewDashboard ? 'bg-indigo-600' : 'bg-zinc-700'}`}><span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pForm.canViewDashboard ? 'translate-x-5' : 'translate-x-0'}`} /></button>
              </div>
              <div className="pt-4"><Button className="w-full" onClick={() => { if (!pForm.firstName || !pForm.email) return showNotification(tr("Name and Email Required", "İsim ve Mail Zorunlu"), "error"); handleAction('post', '/users/register', pForm, tr("Staff Record Created", "Personel Yetkilendirildi")) }}>{tr('Save Record', 'Girişi Kaydet')}</Button></div>
            </div>
          )}
          {drawerType === 'departman' && (
            <div className="space-y-4 animate-in fade-in">
              <Input value={dForm?.ad || ''} placeholder={tr("Department Name", "Birim Adı")} onChange={e => setDForm({ ...dForm, ad: e.target.value })} />
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/departman-ekle', dForm, tr("Department Created", "Birim Açıldı"))}>{tr('Create Department', 'Oluştur')}</Button></div>
            </div>
          )}
          {drawerType === 'maas' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={mForm?.personelId || ''} onChange={e => {
                const targetP = personeller.find(p => p.id === Number(e.target.value));
                const calcBrut = targetP?.gunlukUcret ? targetP.gunlukUcret * 30 : (mForm.brutMaas || mForm.temelMaas || 0);
                const sgkAmt = calcBrut * ((mForm.sgkYuzdesi || 0) / 100);
                const taxAmt = (calcBrut - sgkAmt) * ((mForm.vergiYuzdesi || 0) / 100);
                const calcNet = calcBrut - sgkAmt - taxAmt;
                setMForm({ ...mForm, personelId: e.target.value, brutMaas: calcBrut, temelMaas: Math.round(calcNet) });
              }}><option value="">{tr('Select Staff...', 'Personel Seçin...')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName} {p.gunlukUcret ? `(${p.gunlukUcret} ₺ / ${tr('day', 'gün')})` : ''}</option>)}</Select>

              <Input type="number" value={mForm?.brutMaas || ''} placeholder={tr("Gross Base Salary", "Brüt Maaş (Baz)")} onChange={e => {
                const brut = Number(e.target.value);
                const sgkAmt = brut * ((mForm.sgkYuzdesi || 0) / 100);
                const taxAmt = (brut - sgkAmt) * ((mForm.vergiYuzdesi || 0) / 100);
                setMForm({ ...mForm, brutMaas: brut, temelMaas: Math.round(brut - sgkAmt - taxAmt) });
              }} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('SGK Deduction %', 'SGK Kesintisi %')}</label><Input type="number" value={mForm?.sgkYuzdesi} onChange={e => {
                  const val = Number(e.target.value);
                  const sgkAmt = (mForm.brutMaas || 0) * (val / 100);
                  const taxAmt = ((mForm.brutMaas || 0) - sgkAmt) * ((mForm.vergiYuzdesi || 0) / 100);
                  setMForm({ ...mForm, sgkYuzdesi: val, temelMaas: Math.round((mForm.brutMaas || 0) - sgkAmt - taxAmt) });
                }} /></div>
                <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Income Tax %', 'Gelir Vergisi %')}</label><Input type="number" value={mForm?.vergiYuzdesi} onChange={e => {
                  const val = Number(e.target.value);
                  const sgkAmt = (mForm.brutMaas || 0) * ((mForm.sgkYuzdesi || 0) / 100);
                  const taxAmt = ((mForm.brutMaas || 0) - sgkAmt) * (val / 100);
                  setMForm({ ...mForm, vergiYuzdesi: val, temelMaas: Math.round((mForm.brutMaas || 0) - sgkAmt - taxAmt) });
                }} /></div>
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
                <label className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">{tr('Calculated Net Base', 'Hesaplanan Net Baz Maaş')}</label>
                <Input className="mt-2 text-indigo-300 font-bold bg-transparent border-indigo-500/30 text-lg" type="number" value={mForm?.temelMaas || ''} onChange={e => setMForm({ ...mForm, temelMaas: Number(e.target.value) })} />
              </div>

              <Input type="number" value={mForm?.prim || ''} placeholder={tr("Bonus / Overtime", "Prim / Ek Ödeme (Net)")} onChange={e => setMForm({ ...mForm, prim: Number(e.target.value) })} />
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Payment Date', 'Ödeme Tarihi')}</label><Input type="date" value={mForm?.odemeTarihi || ''} onChange={e => setMForm({ ...mForm, odemeTarihi: e.target.value })} /></div>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/maas-ekle', mForm, tr("Payroll Generated", "Bordro Çıkarıldı"))}>{tr('Generate Payroll', 'Maaş Belirle')}</Button></div>
            </div>
          )}
          {drawerType === 'izin' && (
            <div className="space-y-4 animate-in fade-in">
              {!isManager ? (
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">{tr('Staff Member', 'Personel')}</span>
                    <span className="text-zinc-100 font-semibold">{currentUser?.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">{tr('Department', 'Birim')}</span>
                    <span className="text-zinc-100 font-semibold">{(personeller.find(p => p.id === currentUser?.id)?.departman?.ad) || tr('Unassigned', 'Atanmadı')}</span>
                  </div>
                </div>
              ) : (
                <Select value={iForm?.personelId || ''} onChange={e => setIForm({ ...iForm, personelId: e.target.value })}><option value="">{tr('Select Staff...', 'Personel Seçin...')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              )}

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-400">{tr('Workplace Reg No', 'İşyeri Sicil No')}</label>
                <Input
                  value={iForm?.isYeriSicilNo || '24614010112665580062197000'}
                  readOnly
                  className="bg-zinc-800/20 cursor-not-allowed text-zinc-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400">{tr('Leave Type', 'İzin Türü')}</label>
                  <Select value={iForm?.izinTuru || 'Yıllık İzin'} onChange={e => setIForm({ ...iForm, izinTuru: e.target.value })}>
                    <option value="Yıllık İzin">{tr('Annual Leave', 'Yıllık İzin')}</option>
                    <option value="Mazeret (Ücretsiz)">{tr('Excused (Unpaid)', 'Mazeret (Ücretsiz)')}</option>
                    <option value="Hastalık Raporu">{tr('Medical Leave', 'Rapor/Hastalık')}</option>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400">{tr('Cycle Year', 'İzin Devre Yılı')}</label>
                  <Select value={iForm?.devreYil || ''} onChange={e => setIForm({ ...iForm, devreYil: e.target.value })}>
                    {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400">{tr('Start Date', 'Başlangıç')}</label>
                  <Input type="date" value={iForm?.baslangicTarihi || ''} onChange={e => {
                    const val = e.target.value;
                    const newForm = { ...iForm, baslangicTarihi: val };
                    if (val && iForm.bitisTarihi) {
                      const start = new Date(val);
                      const end = new Date(iForm.bitisTarihi);
                      if (end >= start) {
                        newForm.gunSayisi = Math.floor((end - start) / (86400000)) + 1;
                        const res = new Date(end); res.setDate(res.getDate() + 1);
                        newForm.isBaslamaTarihi = res.toISOString().split('T')[0];
                      }
                    }
                    setIForm(newForm);
                  }} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400">{tr('Days', 'Gün Sayısı')}</label>
                  <Input type="number" value={iForm?.gunSayisi || 1} onChange={e => setIForm({ ...iForm, gunSayisi: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-zinc-400">{tr('End Date', 'Bitiş')}</label>
                  <Input type="date" value={iForm?.bitisTarihi || ''} onChange={e => {
                    const val = e.target.value;
                    const newForm = { ...iForm, bitisTarihi: val };
                    if (val && iForm.baslangicTarihi) {
                      const start = new Date(iForm.baslangicTarihi);
                      const end = new Date(val);
                      if (end >= start) {
                        newForm.gunSayisi = Math.floor((end - start) / (86400000)) + 1;
                        const res = new Date(end); res.setDate(res.getDate() + 1);
                        newForm.isBaslamaTarihi = res.toISOString().split('T')[0];
                      }
                    }
                    setIForm(newForm);
                  }} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-zinc-400">{tr('Resume Date', 'İşe Başlama Tarihi')}</label>
                <Input type="date" value={iForm?.isBaslamaTarihi || ''} onChange={e => setIForm({ ...iForm, isBaslamaTarihi: e.target.value })} />
              </div>

              <textarea className="w-full bg-zinc-900 text-sm text-zinc-100 border border-zinc-800 p-3 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500 resize-none" rows="3" placeholder={tr("Detail your leave request cause...", "İzin detaylarını girin...")} value={iForm?.neden || ''} onChange={e => setIForm({ ...iForm, neden: e.target.value })}></textarea>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/izin-al', iForm, tr("Leave Request Submitted", "Talep İletildi"))}>{tr('Submit Request', 'İzin Talebi Oluştur')}</Button></div>
            </div>
          )}
          {drawerType === 'mesai' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={mesaiForm?.personelId || ''} onChange={e => setMesaiForm({ ...mesaiForm, personelId: e.target.value })} disabled={!isManager}><option value="">{tr('Select Staff...', 'Personel Seçin...')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Date', 'Tarih')}</label><Input type="date" value={mesaiForm?.tarih || ''} onChange={e => setMesaiForm({ ...mesaiForm, tarih: e.target.value })} /></div>
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Start Time', 'Giriş Saati')}</label><Input type="time" value={mesaiForm?.girisSaati || ''} onChange={e => setMesaiForm({ ...mesaiForm, girisSaati: e.target.value })} /></div>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/mesai-baslat', mesaiForm, tr("Attendance Logged", "Turnike Kaydedildi"))}>{tr('Log Timesheet', 'Mesai Başlat')}</Button></div>
            </div>
          )}
          {drawerType === 'duyuru' && (
            <div className="space-y-4 animate-in fade-in">
              <Input value={duyuruForm?.baslik || ''} placeholder={tr("Announcement Title", "Duyuru Konusu")} onChange={e => setDuyuruForm({ ...duyuruForm, baslik: e.target.value })} />
              <textarea className="w-full bg-zinc-900 text-sm text-zinc-100 border border-zinc-800 p-3 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500 resize-none" rows="6" placeholder={tr("Enter announcement content...", "Duyuru metni metini girin")} value={duyuruForm?.icerik || ''} onChange={e => setDuyuruForm({ ...duyuruForm, icerik: e.target.value })}></textarea>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/duyuru-ekle', { ...duyuruForm, yapanKisi: `${currentUser?.name} (${currentUser?.role})` }, tr("Announcement Published", "Panoya Asıldı"))}>{tr('Publish Worldwide', 'Herkes İçin Yayınla')}</Button></div>
            </div>
          )}
          {drawerType === 'zimmet' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={zForm?.personelId || ''} onChange={e => setZForm({ ...zForm, personelId: e.target.value })}><option value="">{tr('Assign To...', 'Şu Kişiye...')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              <Input value={zForm?.esyaAdi || ''} placeholder={tr("Hardware/Item Name", "Materyal / Donanım")} onChange={e => setZForm({ ...zForm, esyaAdi: e.target.value })} />
              <Input value={zForm?.seriNo || ''} placeholder={tr("Serial No / Asset Tag", "Seri Numarası")} onChange={e => setZForm({ ...zForm, seriNo: e.target.value })} />
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Handover Date', 'Teslim Tarihi')}</label><Input type="date" value={zForm?.verilisTarihi || ''} onChange={e => setZForm({ ...zForm, verilisTarihi: e.target.value })} /></div>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/zimmet-ekle', zForm, tr("Asset Assigned", "Zimmet İşlendi"))}>{tr('Save Record', 'Emanete Ekle')}</Button></div>
            </div>
          )}
          {drawerType === 'gorev' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={taskForm?.personelId || ''} onChange={e => setTaskForm({ ...taskForm, personelId: e.target.value })}><option value="">{tr('Assign To...', 'Görevli...')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              <Input value={taskForm?.baslik || ''} placeholder={tr("Task Title", "Görev Başlığı")} onChange={e => setTaskForm({ ...taskForm, baslik: e.target.value })} />
              <textarea className="w-full bg-zinc-900 text-sm text-zinc-100 border border-zinc-800 p-3 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500 resize-none" rows="5" placeholder={tr("Task details and deliverables...", "Yapılacak işlerin detayları...")} value={taskForm?.aciklama || ''} onChange={e => setTaskForm({ ...taskForm, aciklama: e.target.value })}></textarea>
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Deadline', 'Son Mühlet')}</label><Input type="date" value={taskForm?.sonTarih || ''} onChange={e => setTaskForm({ ...taskForm, sonTarih: e.target.value })} /></div>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/task-ekle', taskForm, tr("Task Assigned", "Pano Güncellendi"))}>{tr('Assign Task', 'Görevlendir')}</Button></div>
            </div>
          )}
          {drawerType === 'harcama' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={expForm?.personelId || ''} onChange={e => setExpForm({ ...expForm, personelId: e.target.value })} disabled={!isManager}><option value="">{tr('Select Staff...', 'Personel... ')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              <Input value={expForm?.baslik || ''} placeholder={tr("Expense Title (e.g. Client Dinner)", "Nedeni (Ör: Yemek)")} onChange={e => setExpForm({ ...expForm, baslik: e.target.value })} />
              <Input type="number" value={expForm?.miktar || ''} placeholder={tr("Amount", "Miktar")} onChange={e => setExpForm({ ...expForm, miktar: Number(e.target.value) })} />
              <div className="space-y-1"><label className="text-sm font-medium text-zinc-400">{tr('Date', 'Tarih')}</label><Input type="date" value={expForm?.tarih || ''} onChange={e => setExpForm({ ...expForm, tarih: e.target.value })} /></div>
              <div className="pt-4"><Button className="w-full" onClick={() => handleAction('post', '/users/expense-ekle', expForm, tr("Expense Declared", "Mali Birim'e İletildi"))}>{tr('Submit for Approval', 'Kasaya Bildir')}</Button></div>
            </div>
          )}
          {drawerType === 'belge' && (
            <div className="space-y-4 animate-in fade-in">
              <Select value={docForm?.personelId || ''} onChange={e => setDocForm({ ...docForm, personelId: e.target.value })}><option value="">{tr('Related Staff...', 'İlgili Kişi')}</option>{personeller.map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}</Select>
              <Input value={docForm?.dosyaAdi || ''} placeholder={tr("Document Name", "Belge Adı")} onChange={e => setDocForm({ ...docForm, dosyaAdi: e.target.value })} />
              <Select value={docForm?.dosyaTuru || 'Sözleşme'} onChange={e => setDocForm({ ...docForm, dosyaTuru: e.target.value })}><option value="Sözleşme">{tr('Contract', 'Sözleşme')}</option><option value="Rapor">{tr('Medical Report', 'Hastane Raporu')}</option><option value="Kimlik">{tr('ID Info', 'Kimlik')}</option><option value="Diploma">{tr('Diploma', 'Diploma')}</option><option value="Diğer">{tr('Other', 'Diğer')}</option></Select>
              <div className="pt-4 space-y-3">
                <input
                  type="file"
                  id="doc-file-input"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setDocForm({
                          ...docForm,
                          dosyaIcerik: event.target.result,
                          dosyaAdi: docForm.dosyaAdi || file.name
                        });
                        showNotification(tr("File selected: ", "Dosya seçildi: ") + file.name, "success");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => document.getElementById('doc-file-input').click()}
                >
                  {docForm?.dosyaIcerik ? tr('Change Selection', 'Dosyayı Değiştir') : tr('Browser File (ZIP/PDF/JPG)', 'Dosyayı Seç')}
                </Button>
                {docForm?.dosyaIcerik && (
                  <p className="text-[10px] text-zinc-500 italic text-center">
                    {tr('Ready to archive.', 'Dosya hazır, arşive gönderilebilir.')}
                  </p>
                )}
                <Button className="w-full" onClick={() => handleAction('post', '/users/document-ekle', docForm, tr("Document Archived", "Arşive Kaldırıldı"))}>{tr('Upload to Archive', 'Arşive Yükle')}</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drawer;

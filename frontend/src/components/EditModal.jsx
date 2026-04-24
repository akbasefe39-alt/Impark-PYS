import React from 'react';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { User, Hash, Phone, Briefcase, Building2, Activity, Heart, Contact, X, Save, Banknote } from 'lucide-react';
import { getDict } from '../utils';

const EditModal = ({ editingItem, setEditingItem, departmanlar, maaslar, izinler, isAdmin, handleAction, lang }) => {
  const origEmailRef = React.useRef(editingItem?.email || '');
  React.useEffect(() => {
    if (editingItem && editingItem.id !== origEmailRef.currentId) {
      origEmailRef.current = editingItem.email || '';
      origEmailRef.currentId = editingItem.id;
    }
  }, [editingItem]);

  if (!editingItem) return null;
  const tr = getDict(lang);

  const isSecurityChanged = (editingItem.email !== undefined && editingItem.email !== origEmailRef.current) || (editingItem.password && editingItem.password.length > 0);

  const userMaaslar = maaslar?.filter(m => m.personel?.id === editingItem.id) || [];
  const userIzinler = izinler?.filter(i => i.personel?.id === editingItem.id && i.durum === 'Onaylandı') || [];
  const usedLeaves = userIzinler.reduce((acc, curr) => acc + (curr.gunSayisi || 0), 0);
  const totalLeaves = editingItem.toplamIzinHakki || 14;
  const remainingLeaves = totalLeaves - usedLeaves;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400] flex items-center justify-center p-4 xl:p-0 animate-in fade-in duration-200">
      <div className={`bg-zinc-950 border border-zinc-800 p-6 md:p-8 rounded-xl w-full ${editingItem.type === 'departman' ? 'max-w-md' : 'max-w-4xl'} shadow-2xl flex flex-col max-h-[90vh]`}>
        <header className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800 shrink-0">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
               {editingItem.type === 'departman' ? <Building2 className="w-5 h-5" /> : <User className="w-5 h-5" />}
             </div>
             <div>
               <h2 className="text-lg font-semibold text-zinc-100">{editingItem.type === 'departman' ? tr('Edit Department', 'Birim Düzenle') : tr("Staff Profile", 'Personel Profili')}</h2>
               <p className="text-xs text-zinc-500 mt-0.5">{editingItem.type === 'departman' ? editingItem.ad : tr('Manage staff personal and corporate details', 'Personel bilgilerini yönet')}</p>
             </div>
           </div>
           <button onClick={()=>setEditingItem(null)} className="p-2 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 rounded-md transition-colors">
             <X className="w-5 h-5" />
           </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 text-left">
           {editingItem.type === 'departman' ? (
             <div className="space-y-4">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> {tr('Department Name', 'Birim Adı')}
                </label>
                <Input value={editingItem.ad} onChange={e => setEditingItem({...editingItem, ad: e.target.value})} />
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* KİMLİK */}
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">{tr('Personal Info', 'Kimlik Bilgileri')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">E-Posta</label><Input value={editingItem.email || ''} onChange={e => setEditingItem({...editingItem, email: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">Yeni Şifre</label><Input type="password" value={editingItem.password || ''} placeholder="İstemiyorsanız boş bırakın" onChange={e => setEditingItem({...editingItem, password: e.target.value})} /></div>
                    {isSecurityChanged && (
                      <div className="col-span-1 md:col-span-2 space-y-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg animate-in fade-in">
                        <label className="text-sm font-bold text-red-500">Güvenlik Onayı</label>
                        <Input type="password" value={editingItem.currentPassword || ''} placeholder="Mevcut kendi şifrenizi girerek onaylayın" onChange={e => setEditingItem({...editingItem, currentPassword: e.target.value})} />
                        <p className="text-[10px] text-zinc-500">Güvenlik bilgilerini değiştirdiğiniz için şifreyle onaylamalısınız.</p>
                      </div>
                    )}
                    
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium text-zinc-300 flex items-center gap-2">{tr('Two-Factor Authentication (MFA)', 'İki Faktörlü Doğrulama (MFA)')}</span>
                        <p className="text-[10px] text-zinc-500 leading-tight">{tr('Requires an email code to login.', 'Girişlerde e-posta kodu ister.')}</p>
                      </div>
                      <button type="button" onClick={() => setEditingItem({ ...editingItem, mfaEnabled: !editingItem.mfaEnabled })} className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editingItem.mfaEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}><span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editingItem.mfaEnabled ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                    </div>

                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><User className="w-4 h-4" /> {tr('First Name', 'Ad')}</label><Input value={editingItem.firstName || ''} onChange={e => setEditingItem({...editingItem, firstName: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><User className="w-4 h-4" /> {tr('Last Name', 'Soyad')}</label><Input value={editingItem.lastName || ''} onChange={e => setEditingItem({...editingItem, lastName: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Hash className="w-4 h-4" /> {tr('National ID', 'TC Kimlik')}</label><Input value={editingItem.tcKimlikNo || ''} onChange={e => setEditingItem({...editingItem, tcKimlikNo: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2">{tr('Birth Date', 'Doğum Tarihi')}</label><Input type="date" value={editingItem.dogumTarihi || ''} onChange={e => setEditingItem({...editingItem, dogumTarihi: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Gender', 'Cinsiyet')}</label><Select value={editingItem.cinsiyet || ''} onChange={e => setEditingItem({...editingItem, cinsiyet: e.target.value})}><option value="">{tr('Not Specified', 'Belirtilmedi')}</option><option value="Erkek">{tr('Male', 'Erkek')}</option><option value="Kadın">{tr('Female', 'Kadın')}</option></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Nationality', 'Uyruk')}</label><Select value={editingItem.uyruk || ''} onChange={e => setEditingItem({...editingItem, uyruk: e.target.value})}><option value="">-</option><option value="TC">T.C.</option><option value="KKTC">KKTC</option><option value="Çifte Vatandaş">Çifte Vatandaş</option><option value="Yabancı">Yabancı Uyruk</option></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Activity className="w-4 h-4" /> {tr('Blood Group', 'Kan Grubu')}</label><Select value={editingItem.kanGrubu || ''} onChange={e => setEditingItem({...editingItem, kanGrubu: e.target.value})}><option value="">{tr('Not Specified', 'Belirtilmedi')}</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>0+</option><option>0-</option><option>AB+</option><option>AB-</option></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Heart className="w-4 h-4" /> {tr('Marital Status', 'Medeni Hal')}</label><Select value={editingItem.medeniHal || ''} onChange={e => setEditingItem({...editingItem, medeniHal: e.target.value})}><option value="">{tr('Not Specified', 'Belirtilmedi')}</option><option value="Bekar">{tr('Single', 'Bekar')}</option><option value="Evli">{tr('Married', 'Evli')}</option></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Education', 'Eğitim Durumu')}</label><Select value={editingItem.mezuniyet || ''} onChange={e => setEditingItem({...editingItem, mezuniyet: e.target.value})}><option value="">-</option><option value="İlkokul">İlkokul</option><option value="Ortaokul">Ortaokul</option><option value="Lise">Lise</option><option value="Üniversite">Üniversite</option><option value="Yüksek Lisans">Yüksek Lisans</option></Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Military Status', 'Askerlik Durumu')}</label><Select value={editingItem.askerlikDurumu || ''} onChange={e => setEditingItem({...editingItem, askerlikDurumu: e.target.value})}><option value="">-</option><option value="Yapıldı">Yapıldı</option><option value="Tecilli">Tecilli</option><option value="Muaf">Muaf</option></Select></div>
                  </div>

                  <div className="col-span-1 md:col-span-2 my-2 border-t border-zinc-800"></div>

                  {/* İLETİŞİM */}
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">{tr('Contact', 'İletişim')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Phone className="w-4 h-4" /> {tr('Phone', 'Telefon')}</label><Input value={editingItem.telefon || ''} onChange={e => setEditingItem({...editingItem, telefon: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Emergency Contact', 'Acil Durum Kişisi')}</label><Input value={editingItem.acilDurumKisisi || ''} onChange={e => setEditingItem({...editingItem, acilDurumKisisi: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Emergency Phone', 'Acil Durum Tel')}</label><Input value={editingItem.acilDurumTelefonu || ''} onChange={e => setEditingItem({...editingItem, acilDurumTelefonu: e.target.value})} /></div>
                  </div>
                  <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Contact className="w-4 h-4" /> {tr('Address', 'İkamet Adresi')}</label><textarea className="w-full bg-zinc-900 text-sm text-zinc-100 border border-zinc-800 p-3 rounded-md outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500 resize-none shadow-sm" rows="2" value={editingItem.adres || ''} onChange={e => setEditingItem({...editingItem, adres: e.target.value})}></textarea></div>

                  <div className="col-span-1 md:col-span-2 my-2 border-t border-zinc-800"></div>

                  {/* İŞ BİLGİLERİ */}
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">{tr('Employment', 'İş Bilgileri')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Briefcase className="w-4 h-4" /> {tr('Job Title', 'Ünvan')}</label><Input value={editingItem.unvan || ''} onChange={e => setEditingItem({...editingItem, unvan: e.target.value})} disabled={!isAdmin} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Building2 className="w-4 h-4" /> {tr('Department', 'Departman')}</label><Select value={editingItem.departman?.id || editingItem.departmanId || ''} onChange={e => setEditingItem({...editingItem, departmanId: e.target.value})} disabled={!isAdmin}><option value="">{tr('Select', 'Seçin')}</option>{departmanlar.map(d=><option key={d.id} value={d.id}>{d.ad}</option>)}</Select></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Start Date', 'İşe Giriş')}</label><Input type="date" value={editingItem.iseGirisTarihi || ''} onChange={e => setEditingItem({...editingItem, iseGirisTarihi: e.target.value})} disabled={!isAdmin} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Contract', 'Sözleşme Tipi')}</label><Select value={editingItem.sozlesmeTipi || ''} onChange={e => setEditingItem({...editingItem, sozlesmeTipi: e.target.value})} disabled={!isAdmin}><option value="">-</option><option value="Belirsiz Süreli">Belirsiz Süreli</option><option value="Belirli Süreli">Belirli Süreli</option><option value="Yarı Zamanlı">Yarı Zamanlı</option><option value="Stajyer">Stajyer</option></Select></div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-sm font-medium text-zinc-400">{tr("Driver's License", 'Ehliyet Sınıfları')}</label>
                      <div className="flex flex-wrap gap-2">
                        {['M','A1','A2','A','B1','B','BE','C1','C1E','C','CE','D1','D1E','D','DE','F','G'].map(cls => {
                          const selected = (editingItem.ehliyetSinifi || '').split(',').filter(Boolean);
                          const isChecked = selected.includes(cls);
                          return <button key={cls} type="button" onClick={() => { const next = isChecked ? selected.filter(c => c !== cls) : [...selected, cls]; setEditingItem({...editingItem, ehliyetSinifi: next.join(',')}); }} className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-all ${isChecked ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>{cls}</button>;
                        })}
                      </div>
                    </div>
                    {isAdmin && (<div className="space-y-2"><label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Banknote className="w-4 h-4" /> {tr('Daily Rate', 'Günlük Ücret (₺)')}</label><Input type="number" value={editingItem.gunlukUcret || 0} onChange={e => setEditingItem({...editingItem, gunlukUcret: Number(e.target.value)})} /></div>)}
                  </div>

                  <div className="col-span-1 md:col-span-2 my-2 border-t border-zinc-800"></div>

                  {/* FİNANS & YASAL */}
                  <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">{tr('Finance & Legal', 'Finans & Yasal')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('SGK No', 'SGK Sicil No')}</label><Input value={editingItem.sgkNo || ''} onChange={e => setEditingItem({...editingItem, sgkNo: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('Tax ID', 'Vergi Dairesi / No')}</label><Input value={editingItem.vergiNo || ''} onChange={e => setEditingItem({...editingItem, vergiNo: e.target.value})} /></div>
                    <div className="col-span-1 md:col-span-2 space-y-2"><label className="text-sm font-medium text-zinc-400">{tr('IBAN', 'IBAN (Maaş Hesabı)')}</label><Input value={editingItem.iban || ''} onChange={e => setEditingItem({...editingItem, iban: e.target.value})} /></div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                      <span className="text-sm font-medium text-zinc-300">{tr('Can View Dashboard', 'Özet Paneli Görüntüleyebilir')}</span>
                      <button type="button" onClick={() => setEditingItem({ ...editingItem, canViewDashboard: !editingItem.canViewDashboard })} className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editingItem.canViewDashboard ? 'bg-indigo-600' : 'bg-zinc-700'}`}><span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editingItem.canViewDashboard ? 'translate-x-5' : 'translate-x-0'}`} /></button>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN (SIDEBAR) */}
                <div className="space-y-6">
                  {/* LEAVE SUMMARY */}
                  <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-5 space-y-4">
                     <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <span>{tr('Leave Balance', 'İzin Bakiyesi')}</span>
                        <span className={remainingLeaves < 0 ? 'text-red-400' : 'text-amber-400'}>{remainingLeaves} / {totalLeaves} gün</span>
                     </div>
                     <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden flex">
                        <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (usedLeaves / totalLeaves) * 100)}%` }}></div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <p className="text-lg font-bold text-zinc-100">{usedLeaves}</p>
                          <p className="text-[9px] text-zinc-500 uppercase">{tr('Used', 'Kullanılan')}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                          <p className="text-lg font-bold text-emerald-400">{remainingLeaves}</p>
                          <p className="text-[9px] text-zinc-500 uppercase">{tr('Remaining', 'Kalan')}</p>
                        </div>
                     </div>
                     {isAdmin && (
                       <div className="pt-2">
                         <label className="text-[10px] font-semibold text-zinc-500 block mb-1 uppercase tracking-tighter">{tr('Adjust Entitlement', 'Toplam Hak Tanımla')}</label>
                         <Input type="number" className="h-8 text-xs" value={editingItem.toplamIzinHakki || 14} onChange={e => setEditingItem({...editingItem, toplamIzinHakki: Number(e.target.value)}) } />
                       </div>
                     )}
                  </div>

                  {/* PAYROLL HISTORY */}
                  <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
                     <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                       {tr('Payroll History', 'Maaş Bordro Geçmişi')}
                     </div>
                     <div className="max-h-[350px] overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {userMaaslar.length > 0 ? userMaaslar.map(m => (
                          <div key={m.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-lg group hover:border-indigo-500/30 transition-all cursor-default">
                             <div>
                                <p className="text-xs font-bold text-zinc-200">{(m.temelMaas + m.prim).toLocaleString()} ₺</p>
                                <p className="text-[10px] text-zinc-500">{m.odemeTarihi} <span className="text-zinc-700 ml-1">ID:{m.id}</span></p>
                             </div>
                             <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${m.durum === 'Odendi' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{m.durum === 'Odendi' ? tr('Paid', 'Ödendi') : tr('Pending', 'Bekliyor')}</span>
                          </div>
                        )) : <div className="text-[10px] text-zinc-600 text-center py-6">{tr('No payroll records found.', 'Kayıtlı bordro bulunamadı.')}</div>}
                     </div>
                  </div>
                </div>
             </div>
           )}
        </div>

         <footer className="flex gap-3 pt-6 mt-6 border-t border-zinc-800 shrink-0 justify-end">
            <button 
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors" 
              onClick={()=>setEditingItem(null)}
            >
              {tr('Cancel', 'İptal')}
            </button>
            <Button onClick={() => {
              // 🛡️ 400 HATASI KESİN ÇÖZÜMÜ: SADECE backend'in beklediği alanları (WhiteList) gönder
              const whitelist = [
                'firstName', 'lastName', 'email', 'password', 'currentPassword', 'mfaEnabled',
                'unvan', 'role', 'iseGirisTarihi', 'departmanId', 'canViewDashboard',
                'telefon', 'tcKimlikNo', 'dogumTarihi', 'cinsiyet', 'uyruk', 'kanGrubu',
                'medeniHal', 'mezuniyet', 'askerlikDurumu', 'acilDurumKisisi',
                'acilDurumTelefonu', 'adres', 'sozlesmeTipi', 'ehliyetSinifi',
                'gunlukUcret', 'sgkNo', 'vergiNo', 'iban', 'toplamIzinHakki'
              ];

              const payload = {};
              whitelist.forEach(field => {
                if (editingItem[field] !== undefined) {
                  payload[field] = editingItem[field];
                }
              });

              // Departman ID'sini güvenli bir şekilde al
              const depId = editingItem.departman?.id || editingItem.departmanId;
              if (depId) payload.departmanId = Number(depId);
              
              // Eğer şifre boşsa gönderme
              if (!payload.password || String(payload.password).trim() === '') {
                delete payload.password;
              }

              handleAction(
                'put', 
                `/users/${editingItem.type === 'departman' ? 'departman-guncelle' : 'personel-guncelle'}/${editingItem.id}`, 
                payload, 
                tr("Updates saved successfully", "Bilgiler güncellendi")
              );
            }}>
              <Save className="w-4 h-4" /> {tr('Save Changes', 'Kaydet')}
            </Button>
         </footer>
      </div>
    </div>
  );
};

export default EditModal;

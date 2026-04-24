import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IMPARK_LOGO } from './assets/logo';

export const getDict = (lang) => {
  const isTr = lang === 'TR';
  return (en, trStr) => isTr ? trStr : en;
};

export const downloadCSV = (data, filename) => {
  if (!data || !data.length) return alert('Dışa aktarılacak veri bulunamadı.');
  const headers = Object.keys(data[0]).join(',');
  const csvRows = data.map(row => 
    Object.values(row).map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + '\n' + csvRows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generatePayslipPDF = (m) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text(fixTR("Resmi Maas Bordrosu"), 14, 22);
  doc.setFontSize(11);
  doc.text(`${fixTR('Tarih')}: ${new Date().toLocaleDateString()}   |   ID: #${m.id}`, 14, 30);
  
  autoTable(doc, {
    startY: 40,
    head: [[fixTR('Personel Bilgisi'), fixTR('Detay')]],
    body: [
      [fixTR('Ad Soyad'), fixTR(`${m.personel?.firstName} ${m.personel?.lastName}`)],
      [fixTR('Departman'), fixTR(m.personel?.departman?.ad || 'Atanmadi')],
      [fixTR('Odeme Donemi'), fixTR(m.odemeTarihi)],
      [fixTR('Aciklama'), fixTR(m.aciklama || '-')],
      [fixTR('Durum'), fixTR(m.durum)]
    ],
  });
  
  autoTable(doc, {
    startY: (doc.lastAutoTable?.finalY || 40) + 10,
    head: [[fixTR('Finansal Hesaplama'), fixTR('Tutar (TL)')]],
    body: [
      [fixTR('Brut Maas'), `${m.brutMaas}`],
      [fixTR(`SGK Kesintisi (%${m.sgkYuzdesi})`), `-${(m.brutMaas * m.sgkYuzdesi / 100).toFixed(2)}`],
      [fixTR(`Vergi Kesintisi (%${m.vergiYuzdesi})`), `-${(m.brutMaas * m.vergiYuzdesi / 100).toFixed(2)}`],
      [fixTR('Ek Prim / Hakedis'), `+${m.prim}`],
    ],
    foot: [[fixTR('NET ODENEN'), `${(m.temelMaas + m.prim).toLocaleString()}`]],
    footStyles: { fillColor: [99, 102, 241] } 
  });

  doc.save(`${m.personel?.firstName}_${m.personel?.lastName}_Bordro.pdf`);
};

export const generateLeaveRequestPDF = (i) => {
  try {
    if (!i) {
      console.error("Izin verisi eksik!");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header Section
    // Logo (Left)
    doc.addImage(IMPARK_LOGO, 'JPEG', 14, 10, 25, 25);
    
    // Title (Center)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(fixTR("İZİN FORMU"), pageWidth / 2, 25, { align: 'center' });
    
    // Date (Right)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fixTR('Tarih')}: ${new Date().toLocaleDateString()}`, pageWidth - 14, 35, { align: 'right' });

    // Main Form Table
    const bodyData = [
      [fixTR('Adı ve Soyadı'), ':', fixTR(`${i.personel?.firstName || ''} ${i.personel?.lastName || ''}`)],
      [fixTR('İşyeri Sicil No'), ':', fixTR(i.isYeriSicilNo || '')],
      [fixTR('Çalıştığı Kısım ve İşi'), ':', fixTR(i.personel?.departman?.ad || 'Atanmadı')],
      [fixTR('İzinin Ait Olduğu Devre - Yıl'), ':', fixTR(i.devreYil || '-')],
      [fixTR('İzine Başlama Tarihi'), ':', fixTR(i.baslangicTarihi || '-')],
      [fixTR('İzin Gün Sayısı'), ':', fixTR(`${i.gunSayisi || 0}`)],
      [fixTR('İzin Bitiş Tarihi'), ':', fixTR(i.bitisTarihi || '-')],
      [fixTR('İşe Başlama Tarihi'), ':', fixTR(i.isBaslamaTarihi || '-')],
    ];

    autoTable(doc, {
      startY: 40,
      theme: 'plain',
      body: bodyData,
      styles: { fontSize: 10, cellPadding: 3, textColor: [0, 0, 0] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 5, fontStyle: 'normal' },
        2: { fontStyle: 'normal' }
      },
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.2,
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        const { doc, cell } = data;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.2);
        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        if (data.column.index === 0) doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
        if (data.column.index === 2) doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        if (data.row.index === 0) doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
      }
    });

    let currentY = doc.lastAutoTable.finalY + 0.1;

    // Leave type row inside 
    doc.setDrawColor(0, 0, 0);
    doc.rect(14, currentY, pageWidth - 28, 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(fixTR("İzin Türü:"), 17, currentY + 8);
    
    // Checkboxes 
    doc.setFont('helvetica', 'normal');
    const isAnnual = i.tur === 'Yıllık İzin';
    const isExcused = i.tur === 'Mazeret';

    doc.text(`${isAnnual ? '(X)' : '( )'} ${fixTR('Yıllık izin')}`, 60, currentY + 8);
    doc.text(`${isExcused ? '(X)' : '( )'} ${fixTR('Mazeret-(ücretsiz)')}`, 110, currentY + 8);
    
    currentY += 12;

    // Disclaimer Section
    doc.rect(14, currentY, pageWidth - 28, 30);
    doc.setFontSize(10);
    const disclaimerText = fixTR(`İş kanununu bilmeme rağmen kişisel nedenlerle ${i.gunSayisi || '......'} Gün izin kullanmak istiyorum.`);
    doc.text(disclaimerText, pageWidth / 2, currentY + 12, { align: 'center' });
    doc.text(fixTR("İzin Talep Edenin İmzası: ..................................................."), pageWidth / 2, currentY + 22, { align: 'center' });

    currentY += 30;

    // Approval Section
    const boxWidth = (pageWidth - 28) / 2;
    doc.rect(14, currentY, boxWidth, 10);
    doc.rect(14 + boxWidth, currentY, boxWidth, 10);
    doc.setFont('helvetica', 'bold');
    doc.text(fixTR("Sorumlu Kişi"), 14 + boxWidth / 2, currentY + 7, { align: 'center' });
    doc.text(fixTR("Genel Müdür"), 14 + boxWidth + boxWidth / 2, currentY + 7, { align: 'center' });
    
    doc.rect(14, currentY + 10, boxWidth, 30);
    doc.rect(14 + boxWidth, currentY + 10, boxWidth, 30);

    doc.save(`Izin_Formu_${i.personel?.lastName || 'Talep'}.pdf`);
  } catch (error) {
    console.error("PDF Olusturma Hatasi:", error);
    alert("PDF oluşturulurken bir hata oluştu: " + error.message);
  }
};

/**
 * Türkçeye özel karakterleri jsPDF'in standart fontuyla uyumlu hale getirir.
 * Standard fontlar (Helvetica) Türkçe karakterleri desteklemediği için 
 * karakterleri basitleştirir (ğ -> g, vb.)
 */
export const generateEmployeeCardPDF = (p) => {
  try {
    if (!p) return;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header (Same as Leave PDF)
    doc.addImage(IMPARK_LOGO, 'JPEG', 14, 10, 25, 25);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(fixTR("PERSONEL OZLUK KARTI"), pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${fixTR('Duzenleme Tarihi')}: ${new Date().toLocaleDateString()}`, pageWidth - 14, 35, { align: 'right' });

    // Data Structure
    const bodyData = [
      [fixTR('Ad Soyad'), ':', fixTR(`${p.firstName} ${p.lastName}`)],
      [fixTR('Unvan'), ':', fixTR(p.unvan || '-')],
      [fixTR('Departman'), ':', fixTR(p.departman?.ad || '-')],
      [fixTR('TC Kimlik No'), ':', fixTR(p.tcKimlikNo || '-')],
      [fixTR('E-Posta'), ':', p.email],
      [fixTR('Telefon'), ':', p.telefon || '-'],
      [fixTR('Ise Giris Tarihi'), ':', fixTR(p.iseGirisTarihi || '-')],
      [fixTR('Sözlesme Tipi'), ':', fixTR(p.sozlesmeTipi || '-')],
      [fixTR('Dogum Tarihi'), ':', fixTR(p.dogumTarihi || '-')],
      [fixTR('Uyruk'), ':', fixTR(p.uyruk || '-')],
      [fixTR('Kan Grubu'), ':', fixTR(p.kanGrubu || '-')],
      [fixTR('Medeni Hal'), ':', fixTR(p.medeniHal || '-')],
      [fixTR('Cinsiyet'), ':', fixTR(p.cinsiyet || '-')],
      [fixTR('Mezuniyet'), ':', fixTR(p.mezuniyet || '-')],
      [fixTR('SGK No'), ':', fixTR(p.sgkNo || '-')],
      [fixTR('Vergi No'), ':', fixTR(p.vergiNo || '-')],
      [fixTR('Ehliyet Sinifi'), ':', fixTR(p.ehliyetSinifi || '-')],
      [fixTR('Askerlik Durumu'), ':', fixTR(p.askerlikDurumu || '-')],
      [fixTR('IBAN'), ':', fixTR(p.iban || '-')],
      [fixTR('Adres'), ':', fixTR(p.adres || '-')],
      [fixTR('Acil Durum Kisisi'), ':', fixTR(p.acilDurumKisisi || '-')],
      [fixTR('Acil Durum Tel'), ':', fixTR(p.acilDurumTelefonu || '-')],
    ];

    autoTable(doc, {
      startY: 40,
      theme: 'plain',
      body: bodyData,
      styles: { fontSize: 9, cellPadding: 2, textColor: [40, 40, 40] },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 5, fontStyle: 'normal' },
        2: { fontStyle: 'normal' }
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      margin: { left: 14, right: 14 },
      didDrawCell: (data) => {
        const { doc, cell } = data;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        if (data.column.index === 0) doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
        if (data.column.index === 2) doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        if (data.row.index === 0) doc.line(cell.x, cell.y, cell.x + cell.width, cell.y);
      }
    });

    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(fixTR("Bu belge sistem uzerinden otomatik olarak uretilmistir."), pageWidth / 2, finalY, { align: 'center' });
    
    doc.save(`${p.firstName}_${p.lastName}_Ozluk_Karti.pdf`);
  } catch (err) {
    console.error(err);
    alert("PDF Hatası: " + err.message);
  }
};

export const fixTR = (text) => {
  if (!text) return "";
  const map = {
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C'
  };
  return text.toString().replace(/[ğĞüÜşŞıİöÖçÇ]/g, (m) => map[m]);
};

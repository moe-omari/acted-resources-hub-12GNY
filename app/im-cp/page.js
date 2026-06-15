"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Noto_Sans_Arabic } from 'next/font/google';
import * as XLSX from 'xlsx';
import CreatableSelect from 'react-select/creatable';

const notoArabic = Noto_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600', '700'] });

const getStoredLanguage = () => {
  if (typeof window === 'undefined') return 'ar';
  return window.localStorage.getItem('adminLang') || 'ar';
};

const adminTranslations = {
  en: {
    title: 'ACTED Resource Hub',
    subtitle: 'Admin Control Panel',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter admin username',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    signOutBtn: 'Sign Out',
    backToWeb: '← View Website',
    authSub: 'Please authenticate to manage coordinates & resources',
    incorrectCreds: 'Incorrect username or password',
    adminActive: 'Admin: asaad',
    footerText: 'ACTED Admin Control Panel © {year} • Secure Portal',

    // Toast
    loginSuccess: 'Login successful!',
    logoutSuccess: 'Logged out successfully.',
    failedLoadCoords: 'Failed to load services map coordinates.',
    errorFetchCoords: 'Error fetching coordinates.',
    failedLoadIec: 'Failed to load IEC materials.',
    errorFetchIec: 'Error fetching materials.',
    failedLoadTrans: 'Failed to load site translations.',
    errorFetchTrans: 'Error fetching translations.',
    failedLoadBackups: 'Failed to load backups list.',
    errorFetchBackups: 'Error fetching backups.',
    autoBackupSuccess: 'Automatic daily backup created successfully!',
    manualBackupSuccess: 'Manual backup version created successfully!',
    failedBackup: 'Failed to create backup.',
    errorBackup: 'Error creating backup.',
    restoreSuccess: 'System data restored successfully!',
    failedRestore: 'Failed to restore backup.',
    errorRestore: 'Error restoring backup.',
    deleteBackupSuccess: 'Backup version deleted.',
    failedDeleteBackup: 'Failed to delete backup version.',
    errorDeleteBackup: 'Error deleting backup.',
    fileUploadSuccess: 'File uploaded successfully!',
    failedFileUpload: 'Failed to upload file.',
    errorFileUpload: 'Network error during file upload.',
    coordSaveSuccess: 'Coordinate saved successfully',
    coordSaveError: 'Failed to save coordinate to database',
    coordDeleteSuccess: 'Coordinate deleted successfully',
    coordDeleteError: 'Failed to delete coordinate',
    siteSaveSuccess: 'Site registered successfully',
    siteSaveError: 'Failed to save site changes',
    siteDeleteSuccess: 'Site deleted successfully',
    siteDeleteError: 'Failed to delete site',
    importSuccess: 'Successfully imported {count} items!',
    importError: 'Import failed: {message}',

    // Tabs
    tabCoords: 'Coordinates & Services',
    tabSites: 'Sites & Camps',
    tabIec: 'IEC Awareness Materials',
    tabBackups: 'System Backups',

    // Coordinates
    totalServices: 'Total Services',
    northRegion: 'North Region',
    southRegion: 'South Region',
    addCoordBtn: 'Add New Coordinate',
    searchCoordsPlaceholder: 'Search site, service, or ID...',
    allRegions: 'All Regions',
    thId: 'ID',
    thService: 'Service Name',
    thSite: 'Site Name',
    thRegion: 'Region',
    thCoords: 'Coordinates (Lat / Lng)',
    thOrg: 'Service Provider',
    thActions: 'Actions',
    btnEdit: 'Edit',
    btnDelete: 'Delete',
    generalUnlinked: 'General (Unlinked)',

    // Import/Export
    btnExportExcel: 'Export to Excel',
    btnExportJson: 'Export to JSON',
    btnImportExcel: 'Import from Excel',
    btnImportJson: 'Import from JSON',
    importTitle: 'Import Data',
    importDesc: 'Importing will match by ID. Existing coordinates will be updated, and new IDs will be appended.',

    // Paginator
    paginatorShowing: 'Showing {start} to {end} of {total} entries',
    paginatorFirst: 'First',
    paginatorPrev: 'Prev',
    paginatorNext: 'Next',
    paginatorLast: 'Last',

    // Sites Tab
    totalSites: 'Total Unique Sites',
    registerSiteBtn: 'Register New Site Location',
    searchSitePlaceholder: 'Filter site name...',
    thActiveServices: 'Active Services',
    thApproxCenter: 'Approx. Center',
    btnEditRename: 'Edit/Rename',

    // Backups Tab
    backupStatusActive: 'Daily Automatic Backup Active',
    backupStatusDesc: 'The system creates backups automatically once every 24 hours when the site is accessed. You can also trigger manual snapshot backups before making bulk imports.',
    btnCreateBackup: 'Create Backup Snapshot',
    thBackupDate: 'Backup Date & Time',
    thSnapshotId: 'Snapshot Identifier',
    thStatus: 'Status',
    statusLatest: 'Latest (Auto-Safe)',
    statusArchived: 'Archived',
    btnRestore: 'Restore',

    // IEC Tab
    totalIec: 'Total Materials',
    pdfLeaflets: 'PDF Leaflets',
    imagesFlyers: 'Images / Flyers',
    addIecBtn: 'Add New Material',
    searchIecPlaceholder: 'Search key, title English or Arabic...',
    allFormats: 'All Formats',
    pdfFiles: 'PDF Files',

    // Modals Coordinates
    modalAddCoord: 'Add New Service Coordinate',
    modalEditCoord: 'Edit Service (ID: {id})',
    lblServiceName: 'Service Name / Category',
    lblRegion: 'Region Location',
    lblOrg: 'Service Provider (Optional)',
    lblSiteName: 'Site / Camp Name',
    lblLatitude: 'Latitude',
    lblLongitude: 'Longitude',
    selectSitePrompt: 'Select Existing Site...',
    typeNewSitePrompt: 'Or type a new site location name:',
    btnCancel: 'Cancel',
    btnSave: 'Save Changes',

    // Modals Sites
    modalAddSite: 'Register New Site Location',
    modalEditSite: 'Edit/Rename Site Location ("{name}")',
    lblSiteNameEng: 'English Site Name',
    lblSiteNameAra: 'Arabic Site Name',
    sitePlaceholderAlert: 'Adding a new site will automatically register a central placeholder marker on the map.',
    lblCenterLat: 'Center Latitude',
    lblCenterLng: 'Center Longitude',

    // Modals IEC
    modalAddIec: 'Add New IEC Awareness Material',
    modalEditIec: 'Edit IEC Material ({key})',
    lblSlugKey: 'Slug Key / URL Path (Eng)',
    lblFileFormat: 'File Format Type',
    lblUploadAsset: 'Upload Asset File',
    btnChooseFile: 'Choose PDF or Image File',
    lblUploadedFile: 'Uploaded: {filename}',
    lblAssetPath: 'Asset File Path (auto-filled)',
    lblDownloadFilename: 'Download Saved Filename',
    lblTranslationEn: 'English Translation',
    lblTranslationAr: 'Arabic Translation',
    lblTitle: 'Title',
    lblDescription: 'Description',
    lblUploading: 'Uploading File...',

    // Prompts
    confirmDeleteCoord: 'Are you sure you want to delete this coordinate?',
    confirmDeleteSite: 'Are you sure you want to delete the site "{name}"? This will delete all services and markers associated with this site.',
    confirmDeleteBackup: 'Are you sure you want to delete this backup version ({id}) from the server history?',
    confirmRestoreBackup: 'WARNING: Restoring backup version "{id}" will overwrite your current active coordinates, sites, educational materials, and uploaded asset files. Are you sure you want to restore?',
    confirmDeleteIec: 'Are you sure you want to delete this IEC material?',
  },
  ar: {
    title: 'بوابة موارد أكتد',
    subtitle: 'لوحة تحكم المشرف',
    usernameLabel: 'اسم المستخدم',
    usernamePlaceholder: 'أدخل اسم المستخدم للمشرف',
    passwordLabel: 'كلمة المرور',
    signInBtn: 'تسجيل الدخول',
    signOutBtn: 'تسجيل الخروج',
    backToWeb: '← عرض الموقع',
    authSub: 'يرجى تسجيل الدخول لإدارة الإحداثيات والموارد',
    incorrectCreds: 'اسم المستخدم أو كلمة المرور غير صحيحة',
    adminActive: 'المشرف: asaad',
    footerText: 'لوحة تحكم أكتد © {year} • بوابة آمنة',

    // Toast
    loginSuccess: 'تم تسجيل الدخول بنجاح!',
    logoutSuccess: 'تم تسجيل الخروج بنجاح.',
    failedLoadCoords: 'فشل تحميل إحداثيات خريطة الخدمات.',
    errorFetchCoords: 'خطأ في جلب الإحداثيات.',
    failedLoadIec: 'فشل تحميل المواد التثقيفية.',
    errorFetchIec: 'خطأ في جلب المواد التثقيفية.',
    failedLoadTrans: 'فشل تحميل تراجم المواقع.',
    errorFetchTrans: 'خطأ في جلب التراجم.',
    failedLoadBackups: 'فشل تحميل قائمة النسخ الاحتياطية.',
    errorFetchBackups: 'خطأ في جلب النسخ الاحتياطية.',
    autoBackupSuccess: 'تم إنشاء النسخة الاحتياطية التلقائية اليومية بنجاح!',
    manualBackupSuccess: 'تم إنشاء نسخة احتياطية يدوية بنجاح!',
    failedBackup: 'فشل إنشاء النسخة الاحتياطية.',
    errorBackup: 'خطأ أثناء إنشاء النسخة الاحتياطية.',
    restoreSuccess: 'تم استعادة بيانات النظام بنجاح!',
    failedRestore: 'فشل استعادة النسخة الاحتياطية.',
    errorRestore: 'خطأ أثناء استعادة النسخة الاحتياطية.',
    deleteBackupSuccess: 'تم حذف نسخة الاحتياطية.',
    failedDeleteBackup: 'فشل حذف نسخة الاحتياطية.',
    errorDeleteBackup: 'خطأ أثناء حذف النسخة الاحتياطية.',
    fileUploadSuccess: 'تم رفع الملف بنجاح!',
    failedFileUpload: 'فشل رفع الملف.',
    errorFileUpload: 'خطأ في الشبكة أثناء رفع الملف.',
    coordSaveSuccess: 'تم حفظ الإحداثية بنجاح',
    coordSaveError: 'فشل حفظ الإحداثية في قاعدة البيانات',
    coordDeleteSuccess: 'تم حذف الإحداثية بنجاح',
    coordDeleteError: 'فشل حذف الإحداثية',
    siteSaveSuccess: 'تم تسجيل الموقع بنجاح',
    siteSaveError: 'فشل حفظ تغييرات الموقع',
    siteDeleteSuccess: 'تم حذف الموقع بنجاح',
    siteDeleteError: 'فشل حذف الموقع',
    importSuccess: 'تم استيراد {count} عنصر بنجاح!',
    importError: 'فشل الاستيراد: {message}',

    // Tabs
    tabCoords: 'الإحداثيات والخدمات',
    tabSites: 'المواقع والمخيمات',
    tabIec: 'المواد التثقيفية والتوعوية',
    tabBackups: 'النسخ الاحتياطي للنظام',

    // Coordinates
    totalServices: 'إجمالي الخدمات',
    northRegion: 'منطقة الشمال',
    southRegion: 'منطقة الجنوب',
    addCoordBtn: 'إضافة إحداثية جديدة',
    searchCoordsPlaceholder: 'بحث عن موقع، خدمة، أو رمز معرف...',
    allRegions: 'جميع المناطق',
    thId: 'المعرف',
    thService: 'نوع الخدمة',
    thSite: 'اسم الموقع',
    thRegion: 'المنطقة',
    thCoords: 'الإحداثيات (خط العرض / خط الطول)',
    thOrg: 'مزود الخدمة',
    thActions: 'إجراءات',
    btnEdit: 'تعديل',
    btnDelete: 'حذف',
    generalUnlinked: 'عامة (غير مرتبطة بموقع)',

    // Import/Export
    btnExportExcel: 'تصدير لإكسل',
    btnExportJson: 'تصدير لـ JSON',
    btnImportExcel: 'استيراد من إكسل',
    btnImportJson: 'استيراد من JSON',
    importTitle: 'استيراد البيانات',
    importDesc: 'عملية الاستيراد تطابق العناصر بناءً على المعرف (ID). سيتم تحديث الإحداثيات الموجودة وإضافة المعرفات الجديدة.',

    // Paginator
    paginatorShowing: 'عرض {start} إلى {end} من أصل {total} عناصر',
    paginatorFirst: 'الأول',
    paginatorPrev: 'السابق',
    paginatorNext: 'التالي',
    paginatorLast: 'الأخير',

    // Sites Tab
    totalSites: 'إجمالي المواقع الفريدة',
    registerSiteBtn: 'تسجيل موقع جديد',
    searchSitePlaceholder: 'تصفية اسم الموقع...',
    thActiveServices: 'الخدمات النشطة',
    thApproxCenter: 'المركز التقريبي',
    btnEditRename: 'تعديل / إعادة تسمية',

    // Backups Tab
    backupStatusActive: 'النسخ الاحتياطي التلقائي اليومي نشط',
    backupStatusDesc: 'يقوم النظام بإنشاء نسخة احتياطية تلقائياً كل 24 ساعة عند دخول لوحة التحكم. يمكنك أيضاً إنشاء نسخة يدوية قبل عمليات الاستيراد.',
    btnCreateBackup: 'إنشاء نسخة احتياطية الآن',
    thBackupDate: 'تاريخ ووقت النسخة',
    thSnapshotId: 'رمز النسخة الاحتياطية',
    thStatus: 'الحالة',
    statusLatest: 'الأحدث (حفظ تلقائي)',
    statusArchived: 'مؤرشفة',
    btnRestore: 'استعادة',

    // IEC Tab
    totalIec: 'إجمالي المواد التوعوية',
    pdfLeaflets: 'منشورات PDF',
    imagesFlyers: 'صور / ملصقات',
    addIecBtn: 'إضافة مادة جديدة',
    searchIecPlaceholder: 'بحث في المفاتيح، العناوين بالإنجليزية أو العربية...',
    allFormats: 'كل الصيغ',
    pdfFiles: 'ملفات PDF',

    // Modals Coordinates
    modalAddCoord: 'إضافة إحداثية خدمة جديدة',
    modalEditCoord: 'تعديل الخدمة (معرف: {id})',
    lblServiceName: 'نوع الخدمة / التصنيف',
    lblRegion: 'منطقة الموقع',
    lblOrg: 'مزود الخدمة (اختياري)',
    lblSiteName: 'اسم الموقع / المخيم',
    lblLatitude: 'خط العرض',
    lblLongitude: 'خط الطول',
    selectSitePrompt: 'اختر موقعاً موجوداً...',
    typeNewSitePrompt: 'أو اكتب اسماً لموقع جديد:',
    btnCancel: 'إلغاء',
    btnSave: 'حفظ التغييرات',

    // Modals Sites
    modalAddSite: 'تسجيل موقع مخيم جديد',
    modalEditSite: 'تعديل وتسمية الموقع ("{name}")',
    lblSiteNameEng: 'اسم الموقع بالإنجليزية',
    lblSiteNameAra: 'اسم الموقع بالعربية',
    sitePlaceholderAlert: 'عند إضافة موقع جديد، سيتم تسجيل إحداثية مركزية كعلامة مؤقتة له على الخريطة.',
    lblCenterLat: 'خط العرض المركزي',
    lblCenterLng: 'خط الطول المركزي',

    // Modals IEC
    modalAddIec: 'إضافة مادة توعية (IEC) جديدة',
    modalEditIec: 'تعديل مادة التوعية ({key})',
    lblSlugKey: 'مفتاح المسار / الرابط (إنجليزي)',
    lblFileFormat: 'صيغة الملف',
    lblUploadAsset: 'رفع ملف المادة',
    btnChooseFile: 'اختر ملف PDF أو صورة المادة',
    lblUploadedFile: 'تم الرفع: {filename}',
    lblAssetPath: 'مسار الملف (تعبئة تلقائية)',
    lblDownloadFilename: 'اسم الملف عند التحميل',
    lblTranslationEn: 'الترجمة الإنجليزية',
    lblTranslationAr: 'الترجمة العربية',
    lblTitle: 'العنوان',
    lblDescription: 'الوصف',
    lblUploading: 'جاري رفع الملف...',

    // Prompts
    confirmDeleteCoord: 'هل أنت متأكد من حذف هذه الإحداثية؟',
    confirmDeleteSite: 'هل أنت متأكد من حذف الموقع "{name}"؟ سيؤدي ذلك لحذف جميع الخدمات والعلامات التابعة له على الخريطة.',
    confirmDeleteBackup: 'هل أنت متأكد من حذف هذه النسخة الاحتياطية ({id}) من خادم النظام؟',
    confirmRestoreBackup: 'تحذير: استعادة النسخة الاحتياطية "{id}" ستستبدل وتلغي جميع البيانات المضافة حالياً. هل أنت متأكد من الاستعادة؟',
    confirmDeleteIec: 'هل أنت متأكد من حذف مادة التوعية هذه؟',
  }
};

export default function AdminControlPanel() {
  const [lang, setLang] = useState(() => getStoredLanguage());
  const t = adminTranslations[lang];
  const isArabic = lang === 'ar';

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Tab: 'coordinates', 'sites', 'iec', or 'backups'
  const [activeTab, setActiveTab] = useState('sites');

  // Coordinates data state
  const [coordinates, setCoordinates] = useState([]);
  const [coordSearch, setCoordSearch] = useState('');
  const [coordRegionFilter, setCoordRegionFilter] = useState('all'); // all, North, South
  const [coordProjectFilter, setCoordProjectFilter] = useState('all'); // all, or specific project code
  const [coordSiteFilter, setCoordSiteFilter] = useState('all'); // all, or specific site
  const [coordPage, setCoordPage] = useState(1);
  const coordPerPage = 20;

  // IEC Materials data state
  const [materials, setMaterials] = useState([]);
  const [iecSearch, setIecSearch] = useState('');
  const [iecCategoryFilter, setIecCategoryFilter] = useState('all'); // all, wash, health, protection, vector, unmapped
  const [uploading, setUploading] = useState(false);

  // Sites data search & filter
  const [siteSearch, setSiteSearch] = useState('');
  const [siteRegionFilter, setSiteRegionFilter] = useState('all'); // all, North, South
  const [siteProjectFilter, setSiteProjectFilter] = useState('all'); // all, or specific project code
  const [siteTranslations, setSiteTranslations] = useState({});

  // System backups state
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);

  // Loading states
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [loadingIec, setLoadingIec] = useState(false);

  // Success / Error Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Counts for Stats & Filters
  const northCount = useMemo(() => coordinates.filter((c) => {
    if (c.location !== 'North') return false;
    const trans = siteTranslations[c['site name'] || c.siteName || ''] || {};
    const matchesProject = coordProjectFilter === 'all' || (trans.projectCode || '') === coordProjectFilter;
    const matchesSite = coordSiteFilter === 'all' || (c['site name'] || c.siteName || '') === coordSiteFilter;
    return matchesProject && matchesSite;
  }).length, [coordinates, siteTranslations, coordProjectFilter, coordSiteFilter]);

  const southCount = useMemo(() => coordinates.filter((c) => {
    if (c.location !== 'South') return false;
    const trans = siteTranslations[c['site name'] || c.siteName || ''] || {};
    const matchesProject = coordProjectFilter === 'all' || (trans.projectCode || '') === coordProjectFilter;
    const matchesSite = coordSiteFilter === 'all' || (c['site name'] || c.siteName || '') === coordSiteFilter;
    return matchesProject && matchesSite;
  }).length, [coordinates, siteTranslations, coordProjectFilter, coordSiteFilter]);
  const pdfCount = useMemo(() => materials.filter((m) => m.type === 'pdf').length, [materials]);
  const imageCount = useMemo(() => materials.filter((m) => m.type === 'image').length, [materials]);

  // Import inputs ref
  const importExcelRef = useRef(null);
  const importJsonRef = useRef(null);

  // Modal / Editing states for coordinates
  const [isCoordModalOpen, setIsCoordModalOpen] = useState(false);
  const [editingCoord, setEditingCoord] = useState(null); // null means adding new
  const [coordForm, setCoordForm] = useState({
    name: '',
    location: 'North',
    'site name': '',
    latitude: '',
    longitude: '',
    Org: '',
  });

  // Modal / Editing states for IEC materials
  const [isIecModalOpen, setIsIecModalOpen] = useState(false);
  const [editingIec, setEditingIec] = useState(null); // null means adding new
  const [iecForm, setIecForm] = useState({
    key: '',
    category: 'wash',
    downloadName: '',
    file: '',
    titleEn: '',
    descriptionEn: '',
    titleAr: '',
    descriptionAr: '',
  });

  // Modal / Editing states for Sites
  const [isSiteModalOpen, setIsSiteModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null); // null means adding new
  const [siteForm, setSiteForm] = useState({
    code: '', // Site Code (Primary Key) e.g. KH5452
    projectCode: '', // Project Code e.g. GFM / GNY
    nameEn: '',
    nameAr: '',
    location: 'North',
    latitude: '',
    longitude: '',
    boundaryFile: '',
  });
  const [siteFormError, setSiteFormError] = useState('');
  const [plainCoordinates, setPlainCoordinates] = useState('');

  // Map Preview Modal state
  const [previewMapUrl, setPreviewMapUrl] = useState(null);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    isDanger: false,
    onConfirm: null,
  });

  // Backup modal and name states
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupCustomName, setBackupCustomName] = useState('');

  // Site deletion modal state
  const [deleteSiteModal, setDeleteSiteModal] = useState({
    isOpen: false,
    siteName: '',
    count: 0,
    associatedCoords: []
  });

  const triggerConfirm = ({ title, message, onConfirm, confirmText, cancelText, isDanger = false }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || (isArabic ? 'تأكيد' : 'Confirm'),
      cancelText: cancelText || (isArabic ? 'إلغاء' : 'Cancel'),
      isDanger,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Save selected language to storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('adminLang', lang);
    }
  }, [lang]);

  // Check sessionStorage auth on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = window.sessionStorage.getItem('admin_authenticated');
      if (auth === 'true') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Fetch coordinates, materials, site translations, and backups when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCoordinates();
      fetchMaterials();
      fetchSiteTranslations();
      fetchBackups();
    }
  }, [isAuthenticated]);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };

  const fetchCoordinates = async () => {
    setLoadingCoords(true);
    try {
      const res = await fetch('/api/coordinates');
      if (res.ok) {
        const data = await res.json();
        setCoordinates(data);
      } else {
        showToast(t.failedLoadCoords, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorFetchCoords, 'error');
    } finally {
      setLoadingCoords(false);
    }
  };

  const fetchMaterials = async () => {
    setLoadingIec(true);
    try {
      const res = await fetch('/api/iec-materials');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data);
      } else {
        showToast(t.failedLoadIec, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorFetchIec, 'error');
    } finally {
      setLoadingIec(false);
    }
  };

  const fetchSiteTranslations = async () => {
    try {
      const res = await fetch('/api/site-translations');
      if (res.ok) {
        const data = await res.json();
        setSiteTranslations(data);
      } else {
        showToast(t.failedLoadTrans, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorFetchTrans, 'error');
    }
  };

  const fetchBackups = async () => {
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups);
        if (data.autoBackupTriggered) {
          showToast(t.autoBackupSuccess);
        }
      } else {
        showToast(t.failedLoadBackups, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorFetchBackups, 'error');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          window.sessionStorage.setItem('admin_authenticated', 'true');
          setIsAuthenticated(true);
          setAuthError('');
          showToast(t.loginSuccess);
          return;
        }
      }
      setAuthError(t.incorrectCreds);
    } catch (err) {
      console.error(err);
      setAuthError(isArabic ? 'حدث خطأ في الاتصال بالخادم.' : 'Connection error to authentication server.');
    }
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('admin_authenticated');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    showToast(t.logoutSuccess);
  };

  // File Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setIecForm((prev) => ({
          ...prev,
          file: data.fileUrl,
          downloadName: file.name,
        }));
        showToast(t.fileUploadSuccess);
      } else {
        showToast(t.failedFileUpload, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorFileUpload, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Coordinate handlers
  const openCoordModal = (coord = null) => {
    if (coord) {
      setEditingCoord(coord);
      setCoordForm({
        name: coord.name || '',
        location: coord.location || 'North',
        'site name': coord['site name'] || '',
        latitude: coord.coordinates?.latitude || '',
        longitude: coord.coordinates?.longitude || '',
        Org: coord.Org || '',
      });
    } else {
      const defaultSite = coordSiteFilter !== 'all' ? coordSiteFilter : '';
      const defaultLoc = defaultSite ? (siteTranslations[defaultSite]?.location || 'North') : 'North';
      setEditingCoord(null);
      setCoordForm({
        name: '',
        location: defaultLoc,
        'site name': defaultSite,
        latitude: '',
        longitude: '',
        Org: '',
      });
    }
    setIsCoordModalOpen(true);
  };

  const handleSaveCoordinate = async (e) => {
    e.preventDefault();

    let lat = parseFloat(coordForm.latitude);
    let lng = parseFloat(coordForm.longitude);
    if (isNaN(lat) || isNaN(lng)) {
      showToast('Latitude and Longitude must be valid numbers', 'error');
      return;
    }

    if (lat >= 33.5 && lat <= 36.5 && lng >= 30.5 && lng <= 32.5) {
      const temp = lat;
      lat = lng;
      lng = temp;
      setCoordForm(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
    }

    const selectedSite = coordForm['site name'];
    const inferredLocation = selectedSite ? (siteTranslations[selectedSite]?.location || 'North') : coordForm.location;

    let updatedCoords;
    if (editingCoord) {
      updatedCoords = coordinates.map((c) =>
        c.id === editingCoord.id
          ? {
            ...c,
            name: coordForm.name,
            location: inferredLocation,
            'site name': selectedSite,
            siteName: selectedSite,
            coordinates: { latitude: lat, longitude: lng },
            Org: coordForm.Org,
          }
          : c
      );
    } else {
      const newId = coordinates.reduce((max, c) => (c.id > max ? c.id : max), 0) + 1;
      const newCoord = {
        id: newId,
        name: coordForm.name,
        location: inferredLocation,
        'site name': selectedSite,
        siteName: selectedSite,
        coordinates: { latitude: lat, longitude: lng },
        Org: coordForm.Org,
      };
      updatedCoords = [newCoord, ...coordinates];
    }

    try {
      const res = await fetch('/api/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoords),
      });

      if (res.ok) {
        setCoordinates(updatedCoords);
        setIsCoordModalOpen(false);
        showToast(t.coordSaveSuccess);
      } else {
        showToast(t.coordSaveError, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving coordinate', 'error');
    }
  };

  const handleDeleteCoordinate = (id) => {
    triggerConfirm({
      title: isArabic ? 'حذف إحداثية' : 'Delete Coordinate',
      message: t.confirmDeleteCoord,
      isDanger: true,
      onConfirm: async () => {
        const updatedCoords = coordinates.filter((c) => c.id !== id);

        try {
          const res = await fetch('/api/coordinates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCoords),
          });

          if (res.ok) {
            setCoordinates(updatedCoords);
            showToast(t.coordDeleteSuccess);
            const maxPage = Math.ceil(updatedCoords.length / coordPerPage) || 1;
            if (coordPage > maxPage) {
              setCoordPage(maxPage);
            }
          } else {
            showToast(t.coordDeleteError, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Network error deleting coordinate', 'error');
        }
      }
    });
  };

  // Sites Handlers
  const bulkBoundaryRef = useRef(null);
  const [uploadingBoundary, setUploadingBoundary] = useState(false);

  const handleBulkBoundaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    showToast(isArabic ? 'جاري معالجة طبقة المواقع...' : 'Processing sites layer...', 'info');

    try {
      const res = await fetch('/api/boundaries/bulk', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showToast(isArabic ? `تم المعالجة بنجاح! تم حفظ/تحديث ${data.processedCount} موقع` : `Processed ${data.processedCount} sites successfully!`);
        fetch('/api/site-translations')
          .then((res) => res.json())
          .then((data) => setSiteTranslations(data || {}));
      } else {
        showToast(data.error || 'Failed to process layer', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error processing layer', 'error');
    } finally {
      if (bulkBoundaryRef.current) bulkBoundaryRef.current.value = '';
    }
  };

  const handleBoundaryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!siteForm.code) {
      showToast(isArabic ? 'يرجى إدخال رمز الموقع أولاً' : 'Please enter Site Code first', 'error');
      e.target.value = '';
      return;
    }

    setUploadingBoundary(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'boundary');
    formData.append('customName', siteForm.code);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSiteForm((prev) => ({
          ...prev,
          boundaryFile: data.fileUrl,
        }));
        showToast(isArabic ? 'تم رفع ملف الحدود بنجاح!' : 'Boundary file uploaded successfully!');

        // Auto parse GeoJSON to calculate approximate center
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const geojson = JSON.parse(evt.target.result);
            let coords = [];
            if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
              geojson.features.forEach(f => {
                if (f.geometry && f.geometry.type === 'Polygon') {
                  coords.push(...f.geometry.coordinates[0]);
                } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
                  f.geometry.coordinates.forEach(poly => coords.push(...poly[0]));
                }
              });
            } else if (geojson.type === 'Feature' && geojson.geometry) {
              if (geojson.geometry.type === 'Polygon') {
                coords.push(...geojson.geometry.coordinates[0]);
              }
            } else if (geojson.type === 'Polygon') {
              coords.push(...geojson.coordinates[0]);
            }

            if (coords.length > 0) {
              let latSum = 0;
              let lngSum = 0;
              coords.forEach(c => {
                lngSum += Number(c[0]);
                latSum += Number(c[1]);
              });
              const centerLat = (latSum / coords.length).toFixed(6);
              const centerLng = (lngSum / coords.length).toFixed(6);
              setSiteForm(prev => ({
                ...prev,
                latitude: centerLat,
                longitude: centerLng
              }));
            }
          } catch (err) {
            console.warn('Could not auto-calculate center from GeoJSON', err);
          }
        };
        reader.readAsText(file);
      } else {
        showToast(isArabic ? 'فشل في رفع ملف الحدود' : 'Failed to upload boundary file', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(isArabic ? 'حدث خطأ في شبكة الاتصال أثناء الرفع' : 'Network error during file upload.', 'error');
    } finally {
      setUploadingBoundary(false);
    }
  };

  const handleParsePlainCoordinates = async () => {
    if (!siteForm.code) {
      showToast(isArabic ? 'يرجى إدخال رمز الموقع أولاً' : 'Please enter Site Code first', 'error');
      return;
    }

    const text = plainCoordinates.trim();
    if (!text) {
      showToast(isArabic ? 'يرجى إدخال إحداثيات صالحة' : 'Please enter valid coordinates', 'error');
      return;
    }

    setUploadingBoundary(true);

    try {
      let coords = [];

      const extractCoordinates = (arr) => {
        let extracted = [];
        const walk = (item) => {
          if (!Array.isArray(item)) return;
          if (item.length >= 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
            extracted.push([item[0], item[1], typeof item[2] === 'number' ? item[2] : 0]);
          } else {
            item.forEach(walk);
          }
        };
        walk(arr);
        return extracted;
      };

      if (text.toLowerCase().includes('polygon')) {
        const matches = text.match(/\(([^()]+)\)/g);
        if (matches) {
          let bestCoords = [];
          for (const match of matches) {
            const ringStr = match.slice(1, -1).trim();
            const pairs = ringStr.split(',').map(p => p.trim()).filter(p => p.length > 0);
            const currentCoords = [];
            for (const pair of pairs) {
              const parts = pair.split(/\s+/).map(p => p.trim()).filter(p => p.length > 0);
              if (parts.length >= 2) {
                const lng = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);
                const ele = parts[2] ? parseFloat(parts[2]) : 0;
                if (!isNaN(lng) && !isNaN(lat)) {
                  currentCoords.push([lng, lat, ele]);
                }
              }
            }
            if (currentCoords.length > bestCoords.length) {
              bestCoords = currentCoords;
            }
          }
          if (bestCoords.length > 0) {
            coords = bestCoords;
          }
        }
      }

      if (coords.length === 0 && text.includes('[')) {
        let parsed = null;
        let cleanedText = text.trim().replace(/,\s*$/, '').replace(/,\s*(?=\]|\})/g, '');
        try {
          parsed = JSON.parse(cleanedText);
        } catch (e1) {
          try {
            parsed = JSON.parse("[" + cleanedText + "]");
          } catch (e2) {
            // ignore JSON error, will fall back to plain parser
          }
        }
        if (parsed) {
          coords = extractCoordinates(parsed);
        }
      }

      if (coords.length === 0) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        for (const line of lines) {
          const parts = line.split(/[,\s;]+/).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length < 2) continue;

          const lng = parseFloat(parts[0]);
          const lat = parseFloat(parts[1]);
          const ele = parts[2] ? parseFloat(parts[2]) : 0;

          if (isNaN(lng) || isNaN(lat)) {
            throw new Error(isArabic ? `إحداثي غير صالح: ${line}` : `Invalid coordinate: ${line}`);
          }
          coords.push([lng, lat, ele]);
        }
      }

      coords = coords.map(([lng, lat, ele]) => {
        if (lat >= 33.5 && lat <= 36.5 && lng >= 30.5 && lng <= 32.5) {
          return [lat, lng, ele];
        }
        return [lng, lat, ele];
      });

      if (coords.length < 3) {
        throw new Error(isArabic ? 'تحتاج إلى 3 نقاط على الأقل لتشكيل مضلع' : 'You need at least 3 coordinates to form a polygon.');
      }

      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1], first[2]]);
      }

      const geojson = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [coords]
            },
            properties: {
              site_code: siteForm.code,
              name: siteForm.code
            }
          }
        ]
      };

      const geojsonString = JSON.stringify(geojson, null, 2);
      const blob = new Blob([geojsonString], { type: 'application/json' });
      const virtualFile = new File([blob], `${siteForm.code}.geojson`, { type: 'application/json' });

      const formData = new FormData();
      formData.append('file', virtualFile);
      formData.append('type', 'boundary');
      formData.append('customName', siteForm.code);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setSiteForm((prev) => ({
          ...prev,
          boundaryFile: data.fileUrl,
        }));
        showToast(isArabic ? 'تم إنشاء وحفظ الحدود بنجاح!' : 'Boundary generated and saved successfully!');

        let latSum = 0;
        let lngSum = 0;
        coords.forEach(c => {
          lngSum += Number(c[0]);
          latSum += Number(c[1]);
        });
        const centerLat = (latSum / coords.length).toFixed(6);
        const centerLng = (lngSum / coords.length).toFixed(6);
        setSiteForm(prev => ({
          ...prev,
          latitude: centerLat,
          longitude: centerLng
        }));
      } else {
        const errData = await res.json();
        throw new Error(errData.error || (isArabic ? 'فشل في حفظ الحدود' : 'Failed to save boundary'));
      }
    } catch (err) {
      console.error(err);
      showToast(err.message || (isArabic ? 'حدث خطأ أثناء معالجة الإحداثيات' : 'Error processing coordinates'), 'error');
    } finally {
      setUploadingBoundary(false);
    }
  };

  const openSiteModal = (site = null) => {
    setSiteFormError('');
    setPlainCoordinates('');
    if (site) {
      const siteTrans = siteTranslations[site.name] || { en: site.name, ar: site.name };
      setEditingSite({ oldName: site.name, name: site.name, location: site.location });
      setSiteForm({
        code: site.name,
        siteCode: siteTrans.siteCode || '',
        projectCode: siteTrans.projectCode || '',
        nameEn: siteTrans.en || site.name,
        nameAr: siteTrans.ar || '',
        location: site.location,
        latitude: site.latitude || '',
        longitude: site.longitude || '',
        boundaryFile: siteTrans.boundaryFile || '',
      });

      if (siteTrans.boundaryFile) {
        fetch(siteTrans.boundaryFile)
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error();
          })
          .then((geojson) => {
            let coords = [];
            if (geojson.type === 'FeatureCollection' && Array.isArray(geojson.features)) {
              geojson.features.forEach(f => {
                if (f.geometry && f.geometry.type === 'Polygon') {
                  coords.push(...f.geometry.coordinates[0]);
                } else if (f.geometry && f.geometry.type === 'MultiPolygon') {
                  f.geometry.coordinates.forEach(poly => coords.push(...poly[0]));
                }
              });
            } else if (geojson.type === 'Feature' && geojson.geometry) {
              if (geojson.geometry.type === 'Polygon') {
                coords.push(...geojson.geometry.coordinates[0]);
              }
            } else if (geojson.type === 'Polygon') {
              coords.push(...geojson.coordinates[0]);
            }
            if (coords.length > 0) {
              const coordLines = coords.map(c => `${c[0]},${c[1]},${c[2] !== undefined ? c[2] : 0}`).join('\n');
              setPlainCoordinates(coordLines);
            }
          })
          .catch((err) => {
            console.warn('Could not load existing boundary coordinates into text area', err);
          });
      }
    } else {
      setEditingSite(null);
      setSiteForm({
        code: '',
        projectCode: '',
        nameEn: '',
        nameAr: '',
        location: 'North',
        latitude: '',
        longitude: '',
        boundaryFile: '',
      });
    }
    setIsSiteModalOpen(true);
  };
  const handleSaveSite = async (e) => {
    e.preventDefault();

    try {
      setSiteFormError('');
      const code = (siteForm.code || '').trim();
      const enName = (siteForm.nameEn || '').trim();
      const arName = (siteForm.nameAr || '').trim();

      if (!code || !enName || !arName) {
        setSiteFormError(isArabic ? 'رمز الموقع والاسم بالإنجليزية والعربية مطلوب' : 'Site code, English and Arabic site names are required');
        return;
      }

      if (!editingSite && siteTranslations[code]) {
        setSiteFormError(isArabic ? 'رمز الموقع موجود مسبقاً!' : 'Site code already exists!');
        return;
      }

      let formLat = siteForm.latitude === '' ? '' : parseFloat(siteForm.latitude);
      let formLng = siteForm.longitude === '' ? '' : parseFloat(siteForm.longitude);
      if (formLat !== '' && formLng !== '' && !isNaN(formLat) && !isNaN(formLng)) {
        if (formLat >= 33.5 && formLat <= 36.5 && formLng >= 30.5 && formLng <= 32.5) {
          const temp = formLat;
          formLat = formLng;
          formLng = temp;
          setSiteForm(prev => ({
            ...prev,
            latitude: formLat,
            longitude: formLng
          }));
        }
      }

      let updatedCoords = [...coordinates];
      let updatedTranslations = { ...siteTranslations };

      if (editingSite) {
        const oldName = editingSite.oldName;
        updatedCoords = coordinates.map((c) => {
          const cSiteName = c['site name'] || c.siteName || '';
          if (cSiteName === oldName) {
            return {
              ...c,
              'site name': code,
              siteName: code,
              location: siteForm.location,
            };
          }
          return c;
        });

        if (oldName !== code) {
          delete updatedTranslations[oldName];
        }
        updatedTranslations[code] = {
          en: enName,
          ar: arName,
          boundaryFile: siteForm.boundaryFile || '',
          projectCode: (siteForm.projectCode || '').trim(),
          location: siteForm.location,
          latitude: formLat,
          longitude: formLng
        };
      } else {
        if ((siteForm.latitude !== '' || siteForm.longitude !== '') && (formLat === '' || formLng === '' || isNaN(formLat) || isNaN(formLng))) {
          setSiteFormError(isArabic ? 'خطوط الطول والعرض يجب أن تكون أرقاماً صالحة' : 'Latitude and Longitude must be valid numbers');
          return;
        }

        if (Object.keys(updatedTranslations).some(k => k.toLowerCase() === code.toLowerCase())) {
          setSiteFormError(isArabic ? 'رمز الموقع موجود بالفعل' : 'Site code already exists');
          return;
        }

        updatedTranslations[code] = {
          en: enName,
          ar: arName,
          boundaryFile: siteForm.boundaryFile || '',
          projectCode: (siteForm.projectCode || '').trim(),
          location: siteForm.location,
          latitude: isNaN(formLat) ? '' : formLat,
          longitude: isNaN(formLng) ? '' : formLng
        };
      }

      // Save coordinates
      const resCoords = await fetch('/api/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoords),
      });

      // Save translations
      const resTrans = await fetch('/api/site-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTranslations),
      });

      if (resCoords.ok && resTrans.ok) {
        setCoordinates(updatedCoords);
        setSiteTranslations(updatedTranslations);
        setIsSiteModalOpen(false);
        showToast(t.siteSaveSuccess);
      } else {
        setSiteFormError(t.siteSaveError);
      }
    } catch (err) {
      console.error(err);
      setSiteFormError(err.message || 'Error saving site');
    }
  };

  const handleDeleteSite = (siteName) => {
    const associatedCoords = coordinates.filter((c) => {
      const cSiteName = c['site name'] || c.siteName || '';
      return cSiteName === siteName;
    });

    const count = associatedCoords.length;

    setDeleteSiteModal({
      isOpen: true,
      siteName,
      count,
      associatedCoords
    });
  };

  const executeDeleteSiteWithServices = async (siteName) => {
    setDeleteSiteModal((prev) => ({ ...prev, isOpen: false }));
    setLoadingBackups(true);
    
    const updatedCoords = coordinates.filter((c) => {
      const cSiteName = c['site name'] || c.siteName || '';
      return cSiteName !== siteName;
    });

    let updatedTranslations = { ...siteTranslations };
    delete updatedTranslations[siteName];

    try {
      const resCoords = await fetch('/api/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoords),
      });

      const resTrans = await fetch('/api/site-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTranslations),
      });

      if (resCoords.ok && resTrans.ok) {
        setCoordinates(updatedCoords);
        setSiteTranslations(updatedTranslations);
        showToast(t.siteDeleteSuccess);
      } else {
        showToast(t.siteDeleteError, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting site', 'error');
    } finally {
      setLoadingBackups(false);
    }
  };

  const executeDeleteSiteOnly = async (siteName) => {
    setDeleteSiteModal((prev) => ({ ...prev, isOpen: false }));
    setLoadingBackups(true);

    const updatedCoords = coordinates.map((c) => {
      const cSiteName = c['site name'] || c.siteName || '';
      if (cSiteName === siteName) {
        return {
          ...c,
          'site name': '',
          siteName: '',
        };
      }
      return c;
    });

    let updatedTranslations = { ...siteTranslations };
    delete updatedTranslations[siteName];

    try {
      const resCoords = await fetch('/api/coordinates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCoords),
      });

      const resTrans = await fetch('/api/site-translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTranslations),
      });

      if (resCoords.ok && resTrans.ok) {
        setCoordinates(updatedCoords);
        setSiteTranslations(updatedTranslations);
        showToast(t.siteDeleteSuccess);
      } else {
        showToast(t.siteDeleteError, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error deleting site', 'error');
    } finally {
      setLoadingBackups(false);
    }
  };

  // Backup handlers
  const handleCreateBackup = async (customName = '') => {
    if (!isBackupModalOpen) {
      const now = new Date();
      const pad = (num) => String(num).padStart(2, '0');
      const year = now.getFullYear();
      const month = pad(now.getMonth() + 1);
      const day = pad(now.getDate());
      const hours = pad(now.getHours());
      const minutes = pad(now.getMinutes());
      const seconds = pad(now.getSeconds());
      const defaultName = `backup_${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
      
      setBackupCustomName(defaultName);
      setIsBackupModalOpen(true);
      return;
    }

    setIsBackupModalOpen(false);
    setLoadingBackups(true);
    try {
      const res = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customName }),
      });
      if (res.ok) {
        showToast(t.manualBackupSuccess);
        await fetchBackups();
      } else {
        showToast(t.failedBackup, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(t.errorBackup, 'error');
    } finally {
      setLoadingBackups(false);
    }
  };

  const handleRestoreBackup = (backupId) => {
    triggerConfirm({
      title: isArabic ? 'استعادة نسخة احتياطية' : 'Restore Backup Version',
      message: t.confirmRestoreBackup.replace('{id}', backupId),
      isDanger: true,
      onConfirm: async () => {
        setLoadingBackups(true);
        try {
          const res = await fetch('/api/backups/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ backupId }),
          });

          if (res.ok) {
            showToast(t.restoreSuccess);
            await fetchCoordinates();
            await fetchMaterials();
            await fetchSiteTranslations();
            await fetchBackups();
          } else {
            showToast(t.failedRestore, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast(t.errorRestore, 'error');
        } finally {
          setLoadingBackups(false);
        }
      }
    });
  };

  const handleDeleteBackup = (backupId) => {
    triggerConfirm({
      title: isArabic ? 'حذف نسخة احتياطية' : 'Delete Backup Version',
      message: t.confirmDeleteBackup.replace('{id}', backupId),
      isDanger: true,
      onConfirm: async () => {
        setLoadingBackups(true);
        try {
          const res = await fetch('/api/backups/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ backupId }),
          });

          if (res.ok) {
            showToast(t.deleteBackupSuccess);
            await fetchBackups();
          } else {
            showToast(t.failedDeleteBackup, 'error');
          }
        } catch (err) {
          console.error(err);
          showToast(t.errorDeleteBackup, 'error');
        } finally {
          setLoadingBackups(false);
        }
      }
    });
  };

  // IEC handlers
  const openIecModal = (iec = null) => {
    if (iec) {
      setEditingIec(iec);
      setIecForm({
        key: iec.key || '',
        category: iec.category || 'wash',
        downloadName: iec.downloadName || '',
        file: iec.file || '',
        titleEn: iec.translations?.en?.title || '',
        descriptionEn: iec.translations?.en?.description || '',
        titleAr: iec.translations?.ar?.title || '',
        descriptionAr: iec.translations?.ar?.description || '',
      });
    } else {
      setEditingIec(null);
      setIecForm({
        key: '',
        category: 'wash',
        downloadName: '',
        file: '',
        titleEn: '',
        descriptionEn: '',
        titleAr: '',
        descriptionAr: '',
      });
    }
    setIsIecModalOpen(true);
  };

  const handleSaveIec = async (e) => {
    e.preventDefault();

    if (!iecForm.key || !iecForm.file || !iecForm.titleEn || !iecForm.titleAr) {
      showToast('Key, Asset File, English Title, and Arabic Title are required.', 'error');
      return;
    }

    const fileExt = iecForm.file.split('.').pop().toLowerCase();
    const inferredType = ['pdf'].includes(fileExt) ? 'pdf' : 'image';

    const compiledIec = {
      key: iecForm.key.trim().toLowerCase().replace(/\s+/g, '-'),
      category: iecForm.category,
      href: `/resources/${iecForm.key.trim()}`,
      file: iecForm.file.trim(),
      type: inferredType,
      downloadName: iecForm.downloadName.trim() || `${iecForm.titleEn.trim()}.${inferredType === 'pdf' ? 'pdf' : 'jpg'}`,
      translations: {
        en: {
          title: iecForm.titleEn.trim(),
          description: iecForm.descriptionEn.trim(),
        },
        ar: {
          title: iecForm.titleAr.trim(),
          description: iecForm.descriptionAr.trim(),
        },
      },
    };

    let updatedIec;
    if (editingIec) {
      updatedIec = materials.map((m) => (m.key === editingIec.key ? compiledIec : m));
    } else {
      if (materials.some((m) => m.key === compiledIec.key)) {
        showToast('Material key/slug already exists', 'error');
        return;
      }
      updatedIec = [compiledIec, ...materials];
    }

    try {
      const res = await fetch('/api/iec-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedIec),
      });

      if (res.ok) {
        setMaterials(updatedIec);
        setIsIecModalOpen(false);
        showToast(editingIec ? 'IEC material updated successfully' : 'New IEC material added successfully');
      } else {
        showToast('Failed to save material to database', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving IEC material', 'error');
    }
  };

  const handleDeleteIec = (key) => {
    triggerConfirm({
      title: isArabic ? 'حذف مادة التوعية' : 'Delete IEC Material',
      message: t.confirmDeleteIec,
      isDanger: true,
      onConfirm: async () => {
        const updatedIec = materials.filter((m) => m.key !== key);

        try {
          const res = await fetch('/api/iec-materials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedIec),
          });

          if (res.ok) {
            setMaterials(updatedIec);
            showToast(isArabic ? 'تم حذف مادة التوعية بنجاح' : 'IEC material deleted successfully');
          } else {
            showToast(isArabic ? 'فشل حذف مادة التوعية' : 'Failed to delete IEC material', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast(isArabic ? 'خطأ في الشبكة أثناء الحذف' : 'Network error deleting IEC material', 'error');
        }
      }
    });
  };

  // Helper for timestamped filenames
  const getExportTimestamp = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  // Helper to trigger server-side attachment download via GET redirect
  const triggerServerDownload = async (format, type, data, filename) => {
    try {
      const res = await fetch('/api/download/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, type, data, filename }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.key) {
          window.location.href = `/api/download/${result.key}/${filename}`;
          return;
        }
      }
      showToast(isArabic ? 'فشل تحضير ملف التحميل.' : 'Failed to prepare download file.', 'error');
    } catch (err) {
      console.error(err);
      showToast(isArabic ? 'حدث خطأ أثناء تحميل الملف.' : 'Error during file download.', 'error');
    }
  };

  // EXPORT HANDLERS
  const handleExportJSON = () => {
    const timestamp = getExportTimestamp();
    const filename = `acted-coordinates-${timestamp}.json`;
    triggerServerDownload('json', 'coordinates', coordinates, filename);
  };

  const handleExportExcel = () => {
    const timestamp = getExportTimestamp();
    const filename = `acted-coordinates-${timestamp}.xlsx`;
    const rows = coordinates.map((c) => ({
      ID: c.id,
      Service_Name: c.name,
      Region: c.location,
      Site_Name: c['site name'] || c.siteName || '',
      Latitude: c.coordinates?.latitude || '',
      Longitude: c.coordinates?.longitude || '',
      Org: c.Org || '',
    }));
    triggerServerDownload('xlsx', 'coordinates', rows, filename);
  };

  const handleExportSitesJSON = () => {
    const timestamp = getExportTimestamp();
    const filename = `acted-sites-${timestamp}.json`;
    const siteRows = uniqueSites.map(s => {
      const trans = siteTranslations[s.name] || {};
      return {
        Site_Code: s.name,
        Site_Name_EN: trans.en || s.name,
        Site_Name_AR: trans.ar || '',
        Region: s.location,
        Active_Services_Count: s.count,
        Latitude: s.latitude,
        Longitude: s.longitude,
        Boundary_File_Path: trans.boundaryFile || '',
      };
    });
    triggerServerDownload('json', 'sites', siteRows, filename);
  };

  const handleExportSitesExcel = () => {
    const timestamp = getExportTimestamp();
    const filename = `acted-sites-${timestamp}.xlsx`;
    const siteRows = uniqueSites.map(s => {
      const trans = siteTranslations[s.name] || {};
      return {
        Site_Code: s.name,
        Site_Name_EN: trans.en || s.name,
        Site_Name_AR: trans.ar || '',
        Region: s.location,
        Active_Services_Count: s.count,
        Latitude: s.latitude,
        Longitude: s.longitude,
        Boundary_File_Path: trans.boundaryFile || '',
      };
    });
    triggerServerDownload('xlsx', 'sites', siteRows, filename);
  };

  // IMPORT HANDLERS
  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const importedData = JSON.parse(evt.target.result);
        if (!Array.isArray(importedData)) {
          throw new Error("JSON file must be an array of service coordinates.");
        }

        let updatedCoords = [...coordinates];
        importedData.forEach((item) => {
          const itemId = Number(item.id || item.ID);
          if (!itemId) return;

          const mappedItem = {
            id: itemId,
            name: item.name || item.Service_Name || '',
            location: item.location || item.Region || 'North',
            'site name': item['site name'] || item.siteName || item.Site_Name || '',
            coordinates: {
              latitude: Number(item.coordinates?.latitude ?? item.Latitude ?? 0),
              longitude: Number(item.coordinates?.longitude ?? item.Longitude ?? 0),
            },
            Org: item.Org || item.org || '',
          };

          const index = updatedCoords.findIndex((c) => c.id === itemId);
          if (index > -1) {
            updatedCoords[index] = mappedItem;
          } else {
            updatedCoords.push(mappedItem);
          }
        });

        // Save imported list to server
        const res = await fetch('/api/coordinates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCoords),
        });

        if (res.ok) {
          setCoordinates(updatedCoords);
          showToast(t.importSuccess.replace('{count}', importedData.length));
        } else {
          showToast(t.importError.replace('{message}', 'Failed to save coordinates to database'), 'error');
        }
      } catch (err) {
        showToast(t.importError.replace('{message}', err.message), 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input file choice
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const sheetJson = XLSX.utils.sheet_to_json(worksheet);

        let updatedCoords = [...coordinates];
        sheetJson.forEach((row) => {
          const itemId = Number(row.ID || row.id);
          if (!itemId) return;

          const mappedItem = {
            id: itemId,
            name: row.Service_Name || row.name || '',
            location: row.Region || row.location || 'North',
            'site name': row.Site_Name || row.siteName || row['site name'] || '',
            coordinates: {
              latitude: Number(row.Latitude || row.latitude || 0),
              longitude: Number(row.Longitude || row.longitude || 0),
            },
            Org: row.Org || row.org || '',
          };

          const index = updatedCoords.findIndex((c) => c.id === itemId);
          if (index > -1) {
            updatedCoords[index] = mappedItem;
          } else {
            updatedCoords.push(mappedItem);
          }
        });

        // Save to server
        const res = await fetch('/api/coordinates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCoords),
        });

        if (res.ok) {
          setCoordinates(updatedCoords);
          showToast(t.importSuccess.replace('{count}', sheetJson.length));
        } else {
          showToast(t.importError.replace('{message}', 'Failed to save to database'), 'error');
        }
      } catch (err) {
        showToast(t.importError.replace('{message}', err.message), 'error');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Filter coordinate data
  const filteredCoords = coordinates.filter((c) => {
    const q = coordSearch.toLowerCase();
    const nameMatches = (c.name || '').toLowerCase().includes(q);
    const siteMatches = (c['site name'] || '').toLowerCase().includes(q);
    const idMatches = String(c.id).includes(q);
    const matchesSearch = nameMatches || siteMatches || idMatches;

    const matchesRegion = coordRegionFilter === 'all' || c.location === coordRegionFilter;

    // Project filter logic
    const siteTrans = siteTranslations[c['site name'] || c.siteName || ''] || {};
    const matchesProject = coordProjectFilter === 'all' || (siteTrans.projectCode || '') === coordProjectFilter;
    const matchesSite = coordSiteFilter === 'all' || (c['site name'] || c.siteName || '') === coordSiteFilter;

    return matchesSearch && matchesRegion && matchesProject && matchesSite;
  });

  const totalCoordPages = Math.ceil(filteredCoords.length / coordPerPage) || 1;
  const paginatedCoords = filteredCoords.slice(
    (coordPage - 1) * coordPerPage,
    coordPage * coordPerPage
  );

  // Filter IEC materials data
  const filteredIec = materials.filter((m) => {
    const q = iecSearch.toLowerCase();
    const titleEnMatches = (m.translations?.en?.title || '').toLowerCase().includes(q);
    const titleArMatches = (m.translations?.ar?.title || '').toLowerCase().includes(q);
    const keyMatches = (m.key || '').toLowerCase().includes(q);
    const matchesSearch = titleEnMatches || titleArMatches || keyMatches;

    const matchesCategory = iecCategoryFilter === 'all' || (m.category || 'unmapped') === iecCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Unique sites calculation (using dynamic translation lookups)
  const uniqueSites = useMemo(() => {
    const siteMap = new Map();

    // First, populate all sites from siteTranslations
    Object.keys(siteTranslations).forEach((siteName) => {
      const trans = siteTranslations[siteName] || {};
      siteMap.set(siteName, {
        name: siteName,
        location: trans.location || 'North',
        count: 0,
        latSum: 0,
        lngSum: 0,
        staticLat: trans.latitude || null,
        staticLng: trans.longitude || null,
      });
    });

    coordinates.forEach((c) => {
      const siteName = c['site name'] || c.siteName || '';
      if (!siteName) return;

      const region = c.location || 'North';
      if (!siteMap.has(siteName)) {
        siteMap.set(siteName, {
          name: siteName,
          location: region,
          count: 0,
          latSum: 0,
          lngSum: 0,
          staticLat: null,
          staticLng: null,
        });
      } else {
        // Update location to match coordinate if it was just default
        const entry = siteMap.get(siteName);
        if (!siteTranslations[siteName]?.location) {
          entry.location = region;
        }
      }

      const entry = siteMap.get(siteName);
      entry.count += 1;
      if (c.coordinates?.latitude && c.coordinates?.longitude) {
        entry.latSum += Number(c.coordinates.latitude);
        entry.lngSum += Number(c.coordinates.longitude);
      }
    });

    return Array.from(siteMap.values()).map((s) => ({
      name: s.name,
      location: s.location,
      count: s.count,
      latitude: s.count > 0 && s.latSum ? s.latSum / s.count : (s.staticLat || 31.5),
      longitude: s.count > 0 && s.lngSum ? s.lngSum / s.count : (s.staticLng || 34.4),
    }));
  }, [coordinates, siteTranslations]);

  const filteredSites = uniqueSites.filter((s) => {
    const trans = siteTranslations[s.name] || {};
    const q = siteSearch.toLowerCase();
    const matchesCode = s.name.toLowerCase().includes(q);
    const matchesEn = (trans.en || '').toLowerCase().includes(q);
    const matchesAr = (trans.ar || '').toLowerCase().includes(q);
    const matchesProjectSearch = (trans.projectCode || '').toLowerCase().includes(q);

    const matchesSearch = matchesCode || matchesEn || matchesAr || matchesProjectSearch;
    const matchesRegion = siteRegionFilter === 'all' || s.location === siteRegionFilter;
    const matchesProject = siteProjectFilter === 'all' || (trans.projectCode || '') === siteProjectFilter;

    return matchesSearch && matchesRegion && matchesProject;
  });

  // Creatable options for Project Code combobox
  const projectCodeOptions = useMemo(() => {
    const projects = new Set();
    Object.values(siteTranslations).forEach((t) => {
      if (t && t.projectCode) projects.add(t.projectCode);
    });
    return Array.from(projects).map((p) => ({ value: p, label: p }));
  }, [siteTranslations]);

  // Creatable options for Service Name combobox
  const serviceTypeOptions = useMemo(() => {
    const mainCategories = [
      'Water Trucking - Distribution Point',
      'Health Space/Clinic',
      'Community Kitchen/Tekeya',
      'Bakery',
      'TLS/School',
      'Community Space',
      'Safe Spaces for Women and Girls (WGSS)',
      'Safe space',
      'Nutrition Center',
      'Distribution Point',
      'Social Activity',
      'Other'
    ];
    
    const categoryLabels = {
      en: {
        'Water Trucking - Distribution Point': 'Water Trucking - Distribution Point',
        'Health Space/Clinic': 'Health Space/Clinic',
        'Community Kitchen/Tekeya': 'Community Kitchen/Tekeya',
        Bakery: 'Bakery',
        'TLS/School': 'TLS/School',
        'Community Space': 'Community Space',
        'Safe Spaces for Women and Girls (WGSS)': 'Safe Spaces for Women and Girls (WGSS)',
        'Safe space': 'Safe space',
        'Nutrition Center': 'Nutrition Center',
        'Distribution Point': 'Distribution Point',
        'Social Activity': 'Social Activity',
        'Other': 'Other',
      },
      ar: {
        'Water Trucking - Distribution Point': 'نقطة توزيع مياه (Water Trucking)',
        'Health Space/Clinic': 'مساحة صحية / عيادة (Health Space/Clinic)',
        'Community Kitchen/Tekeya': 'مطبخ مجتمعي / تكية (Community Kitchen)',
        Bakery: 'مخبز (Bakery)',
        'TLS/School': 'مدرسة / مساحة تعليمية (TLS/School)',
        'Community Space': 'مساحة مجتمعية (Community Space)',
        'Safe Spaces for Women and Girls (WGSS)': 'مساحات آمنة للنساء والفتيات (WGSS)',
        'Safe space': 'مساحة آمنة (Safe space)',
        'Nutrition Center': 'مركز تغذية (Nutrition Center)',
        'Distribution Point': 'نقطة توزيع (Distribution Point)',
        'Social Activity': 'نشاط اجتماعي (Social Activity)',
        'Other': 'أخرى (Other)',
      }
    };

    const existingTypes = coordinates.map((c) => c.name).filter(Boolean);
    const combined = [...new Set([...mainCategories, ...existingTypes])];
    
    return combined.map((t) => {
      const label = isArabic 
        ? (categoryLabels.ar[t] || t) 
        : (categoryLabels.en[t] || t);
      return { value: t, label };
    });
  }, [coordinates, isArabic]);

  // Style helper for react-select combobox (dark mode matching ACTED theme)
  const reactSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: '#18181b', // zinc-900
      borderColor: state.isFocused ? '#2563eb' : '#27272a', // blue-600 / zinc-800
      color: '#fff',
      padding: '2px',
      borderRadius: '0.75rem',
      boxShadow: state.isFocused ? '0 0 0 1px #2563eb' : 'none',
      '&:hover': {
        borderColor: '#3f3f46'
      }
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: '#09090b', // zinc-950
      border: '1px solid #27272a',
      borderRadius: '0.75rem'
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#18181b' : 'transparent',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '0.75rem',
      '&:active': {
        backgroundColor: '#2563eb'
      }
    }),
    input: (base) => ({ ...base, color: '#fff', fontSize: '0.75rem' }),
    singleValue: (base) => ({ ...base, color: '#fff', fontSize: '0.75rem' }),
    placeholder: (base) => ({ ...base, color: '#71717a', fontSize: '0.75rem' })
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[35vw] h-[35vw] bg-blue-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-[#1b1464]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md bg-zinc-950/80 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10 backdrop-blur-md">
          <div className="flex flex-col items-center mb-6">
            <img src="/assets/acted-logo.png" alt="ACTED Logo" className="h-16 w-auto mb-3" />
            <h2 className="text-2xl font-extrabold text-white">ACTED Control Panel</h2>
            <p className="text-zinc-400 text-xs mt-1">{t.authSub}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">{t.usernameLabel}</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-left"
                placeholder={t.usernamePlaceholder}
              />
            </div>

            <div>
              <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">{t.passwordLabel}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-left"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-xs font-semibold mt-1 bg-red-950/20 border border-red-900/30 p-2 rounded-lg text-center">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-600/15 active:scale-[0.98] transition-all text-sm"
            >
              {t.signInBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans ${isArabic ? `rtl ${notoArabic.className}` : ''}`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 ${isArabic ? 'left-4' : 'right-4'} z-50 px-5 py-3.5 rounded-2xl shadow-xl border flex items-center gap-3 transition-all duration-300 transform translate-y-0 ${toast.type === 'error'
            ? 'bg-red-950/90 border-red-800 text-red-200'
            : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}>
          <span className="w-2.5 h-2.5 rounded-full animate-ping bg-current"></span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-zinc-900/50 border-b border-zinc-800 py-3.5 px-6 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/assets/acted-logo.png" alt="ACTED Logo" className="h-11 w-auto" />
            <div className="h-8 w-px bg-zinc-800"></div>
            <div>
              <h1 className="text-lg font-black text-white leading-tight">{t.title}</h1>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white px-3.5 py-2 text-xs font-extrabold shadow transition-all border border-zinc-700 cursor-pointer"
            >
              <img src="/assets/translate.png" alt="" className="h-4 w-4" />
              <span>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {t.adminActive}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-zinc-850 hover:bg-zinc-800 text-zinc-350 hover:text-white transition-all cursor-pointer font-bold"
            >
              {t.signOutBtn}
            </button>
          </div>
        </div>
      </header>

      {/* Hidden File Inputs for Import */}
      <input
        type="file"
        ref={importExcelRef}
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleImportExcel}
      />
      <input
        type="file"
        ref={importJsonRef}
        accept=".json"
        className="hidden"
        onChange={handleImportJSON}
      />

      {/* Control Panel Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 flex flex-col gap-6">

        {/* Navigation Tabs */}
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('sites')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'sites'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
            >
              {t.tabSites} ({uniqueSites.length})
            </button>
            <button
              onClick={() => setActiveTab('coordinates')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'coordinates'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
            >
              {t.tabCoords}
            </button>
            <button
              onClick={() => setActiveTab('iec')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'iec'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
            >
              {t.tabIec}
            </button>
            <button
              onClick={() => setActiveTab('backups')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${activeTab === 'backups'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                }`}
            >
              {t.tabBackups} ({backups.length})
            </button>
          </div>

          <Link
            href="/resources"
            className="inline-flex self-start lg:self-auto items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all whitespace-nowrap"
          >
            {t.backToWeb}
          </Link>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'coordinates' ? (
          /* COORDINATES TAB */
          <div className="space-y-6 flex-1 flex flex-col">

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.totalServices}</span>
                <span className="text-2xl font-black text-white mt-1">{coordinates.length}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.northRegion}</span>
                <span className="text-2xl font-black text-sky-400 mt-1">{northCount}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.southRegion}</span>
                <span className="text-2xl font-black text-emerald-400 mt-1">{southCount}</span>
              </div>
              <button
                onClick={() => openCoordModal(null)}
                className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 p-4 rounded-2xl flex flex-col justify-center items-center text-blue-400 transition-all group cursor-pointer"
              >
                <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
                <span className="text-xs font-extrabold uppercase tracking-wide">{t.addCoordBtn}</span>
              </button>
            </div>

            {/* List, Search, Import & Export Controls */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-stretch sm:items-center">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={t.searchCoordsPlaceholder}
                    value={coordSearch}
                    onChange={(e) => {
                      setCoordSearch(e.target.value);
                      setCoordPage(1);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                  />
                </div>

                {/* Region Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => { setCoordRegionFilter('all'); setCoordPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${coordRegionFilter === 'all'
                        ? 'bg-zinc-800 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {t.allRegions}
                  </button>
                  <button
                    onClick={() => { setCoordRegionFilter('North'); setCoordPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${coordRegionFilter === 'North'
                        ? 'bg-sky-600/20 text-sky-400 border border-sky-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {isArabic ? `الشمال (${northCount})` : `North (${northCount})`}
                  </button>
                  <button
                    onClick={() => { setCoordRegionFilter('South'); setCoordPage(1); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${coordRegionFilter === 'South'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {isArabic ? `الجنوب (${southCount})` : `South (${southCount})`}
                  </button>
                </div>

                {/* Site Filter */}
                <div className="relative w-full sm:w-48">
                  <select
                    value={coordSiteFilter}
                    onChange={(e) => { setCoordSiteFilter(e.target.value); setCoordPage(1); }}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all appearance-none"
                  >
                    <option value="all">{isArabic ? 'كل المواقع' : 'All Sites'}</option>
                    {uniqueSites.map((s) => {
                      const trans = siteTranslations[s.name] || {};
                      const siteDisplayName = isArabic ? (trans.ar || s.name) : (trans.en || s.name);
                      return (
                        <option key={s.name} value={s.name}>{siteDisplayName}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Import & Export Operations */}
              <div className="flex gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
                <button
                  onClick={handleExportExcel}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  📄 {t.btnExportExcel}
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  ⚙️ {t.btnExportJson}
                </button>
                <button
                  onClick={() => importExcelRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  📥 {t.btnImportExcel}
                </button>
                <button
                  onClick={() => importJsonRef.current?.click()}
                  className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  📥 {t.btnImportJson}
                </button>
              </div>
            </div>

            {/* Coordinates Table */}
            <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 rounded-2xl bg-zinc-900/10">
              {loadingCoords ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-bold">Loading coordinates list...</div>
              ) : filteredCoords.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-500 font-bold">No services matches found.</div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className={`w-full border-collapse ${isArabic ? 'text-right' : 'text-left'}`}>
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider bg-zinc-900/40">
                        <th className={`py-3.5 px-4 w-16 ${isArabic ? 'text-right' : 'text-center'}`}>{t.thId}</th>
                        <th className={`py-3.5 px-4 w-1/4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thService}</th>
                        <th className={`py-3.5 px-4 w-1/4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thSite}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thRegion}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thCoords}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thOrg}</th>
                        <th className="py-3.5 px-4 text-center w-28">{t.thActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-xs">
                      {paginatedCoords.map((coord) => {
                        const sTrans = siteTranslations[coord['site name']] || {};
                        const isGeneral = !coord['site name'];
                        let displaySiteName = isArabic ? (sTrans.ar || coord['site name']) : (sTrans.en || coord['site name']);
                        if (isGeneral) {
                          displaySiteName = isArabic ? 'عامة (غير مرتبطة بموقع)' : 'General (Unlinked)';
                        }

                        return (
                          <tr key={coord.id} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 px-4 font-mono text-center text-zinc-500">{coord.id}</td>
                            <td className="py-3 px-4 font-bold text-white">{coord.name}</td>
                            <td className={`py-3 px-4 ${isGeneral ? 'text-zinc-500 italic' : 'text-zinc-300'}`}>{displaySiteName}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${coord.location === 'North'
                                  ? 'bg-sky-500/10 text-sky-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {coord.location}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                              {coord.coordinates?.latitude?.toFixed(6)}, {coord.coordinates?.longitude?.toFixed(6)}
                            </td>
                            <td className="py-3 px-4 text-zinc-400">{coord.Org || '—'}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => openCoordModal(coord)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  {t.btnEdit}
                                </button>
                                <button
                                  onClick={() => setPreviewMapUrl(`/service-mapping?site=${encodeURIComponent(coord['site name'])}&service=${encodeURIComponent(coord.name)}&embedded=true`)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-350 font-bold transition-all text-[11px] flex items-center justify-center cursor-pointer"
                                >
                                  {isArabic ? 'معاينة' : 'Preview'}
                                </button>
                                <button
                                  onClick={() => handleDeleteCoordinate(coord.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400 hover:text-red-350 font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  {t.btnDelete}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Paginator */}
              {!loadingCoords && totalCoordPages > 1 && (
                <div className="border-t border-zinc-800 p-4 flex items-center justify-between gap-4 bg-zinc-900/30 flex-wrap">
                  <span className="text-[11px] text-zinc-400">
                    {t.paginatorShowing
                      .replace('{start}', ((coordPage - 1) * coordPerPage) + 1)
                      .replace('{end}', Math.min(coordPage * coordPerPage, filteredCoords.length))
                      .replace('{total}', filteredCoords.length)
                    }
                  </span>

                  <div className="flex gap-1.5">
                    <button
                      disabled={coordPage === 1}
                      onClick={() => setCoordPage(1)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold cursor-pointer"
                    >
                      {t.paginatorFirst}
                    </button>
                    <button
                      disabled={coordPage === 1}
                      onClick={() => setCoordPage((p) => p - 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold cursor-pointer"
                    >
                      {t.paginatorPrev}
                    </button>
                    <span className="px-3.5 py-1.5 rounded-lg bg-zinc-950 text-white font-mono text-[11px] border border-zinc-800">
                      {isArabic ? `صفحة ${coordPage} من ${totalCoordPages}` : `Page ${coordPage} of ${totalCoordPages}`}
                    </span>
                    <button
                      disabled={coordPage === totalCoordPages}
                      onClick={() => setCoordPage((p) => p + 1)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold cursor-pointer"
                    >
                      {t.paginatorNext}
                    </button>
                    <button
                      disabled={coordPage === totalCoordPages}
                      onClick={() => setCoordPage(totalCoordPages)}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold cursor-pointer"
                    >
                      {t.paginatorLast}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'sites' ? (
          /* SITES MANAGEMENT TAB */
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-855 p-4 rounded-2xl flex flex-col col-span-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.totalSites}</span>
                <span className="text-2xl font-black text-white mt-1">{filteredSites.length}</span>
              </div>
              <button
                onClick={() => openSiteModal(null)}
                className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 p-4 rounded-2xl flex flex-col justify-center items-center text-blue-400 transition-all group cursor-pointer col-span-1"
              >
                <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                </svg>
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-center">{t.registerSiteBtn}</span>
              </button>

              <input
                type="file"
                accept=".json,.geojson"
                className="hidden"
                ref={bulkBoundaryRef}
                onChange={handleBulkBoundaryUpload}
              />
              <button
                onClick={() => bulkBoundaryRef.current?.click()}
                className="bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-center items-center text-emerald-400 transition-all group cursor-pointer col-span-1"
              >
                <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-center">{isArabic ? 'رفع طبقة حدود المواقع' : 'Bulk Boundary Layer'}</span>
              </button>
            </div>
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-stretch sm:items-center">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={t.searchSitePlaceholder}
                    value={siteSearch}
                    onChange={(e) => setSiteSearch(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                  />
                </div>

                {/* Region Filter */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSiteRegionFilter('all')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${siteRegionFilter === 'all'
                        ? 'bg-zinc-800 text-white'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {t.allRegions}
                  </button>
                  <button
                    onClick={() => setSiteRegionFilter('North')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${siteRegionFilter === 'North'
                        ? 'bg-sky-600/20 text-sky-400 border border-sky-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {isArabic ? `الشمال` : `North`}
                  </button>
                  <button
                    onClick={() => setSiteRegionFilter('South')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${siteRegionFilter === 'South'
                        ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                      }`}
                  >
                    {isArabic ? `الجنوب` : `South`}
                  </button>
                </div>

                {/* Project Filter */}
                <div className="relative w-full sm:w-48">
                  <select
                    value={siteProjectFilter}
                    onChange={(e) => setSiteProjectFilter(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all appearance-none"
                  >
                    <option value="all">{isArabic ? 'كل المشاريع' : 'All Projects'}</option>
                    {projectCodeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
                <button
                  onClick={handleExportSitesExcel}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  📄 {isArabic ? 'تصدير المواقع لإكسل' : 'Export Sites to Excel'}
                </button>
                <button
                  onClick={handleExportSitesJSON}
                  className="px-3.5 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  ⚙️ {isArabic ? 'تصدير المواقع لـ JSON' : 'Export Sites to JSON'}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 rounded-2xl bg-zinc-900/10">
              {filteredSites.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-500 font-bold">No sites found.</div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className={`w-full border-collapse ${isArabic ? 'text-right' : 'text-left'}`}>
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider bg-zinc-900/40">
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'رمز الموقع (المفتاح الأساسي)' : 'Site Code (Primary Key)'}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'رمز المشروع' : 'Project Code'}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'الاسم بالإنجليزية' : 'Site Name (English)'}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{isArabic ? 'الاسم بالعربية' : 'Site Name (Arabic)'}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thRegion}</th>
                        <th className={`py-3.5 px-4 text-center`}>{t.thActiveServices}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thApproxCenter}</th>
                        <th className="py-3.5 px-4 text-center w-36">{t.thActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-xs">
                      {filteredSites.map((site) => {
                        const siteTrans = siteTranslations[site.name] || {};
                        return (
                          <tr key={site.name} className="hover:bg-zinc-900/30 transition-colors">
                            <td className="py-3 px-4 font-bold text-white font-mono">
                              <div className="flex items-center gap-2">
                                <span>{site.name}</span>
                                {siteTrans.boundaryFile && (
                                  <span 
                                    title={isArabic ? "تم تحديد الحدود للموقع" : "Boundaries set for this site"} 
                                    className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold uppercase tracking-wide cursor-help"
                                  >
                                    {isArabic ? "حدود" : "Bound"}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-amber-400 font-bold font-mono">{siteTrans.projectCode || '—'}</td>
                            <td className="py-3 px-4 text-zinc-300 font-mono">{siteTrans.en || site.name}</td>
                            <td className="py-3 px-4 text-zinc-300 font-medium">{siteTrans.ar || '—'}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${site.location === 'North'
                                  ? 'bg-sky-500/10 text-sky-400'
                                  : 'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                {site.location}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-zinc-300">{site.count}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                              {site.latitude.toFixed(6)}, {site.longitude.toFixed(6)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => openSiteModal(site)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  {t.btnEditRename}
                                </button>
                                 <button
                                  onClick={() => {
                                    setCoordSiteFilter(site.name);
                                    setCoordPage(1);
                                    setActiveTab('coordinates');
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-950/20 border border-blue-900/30 hover:bg-blue-900/30 text-blue-400 hover:text-blue-350 font-bold transition-all text-[11px] flex items-center justify-center cursor-pointer"
                                >
                                  {isArabic ? 'الخدمات' : 'Services'}
                                </button>
                                <button
                                  onClick={() => setPreviewMapUrl(`/service-mapping?site=${encodeURIComponent(site.name)}&embedded=true`)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-350 font-bold transition-all text-[11px] flex items-center justify-center cursor-pointer"
                                >
                                  {isArabic ? 'معاينة' : 'Preview'}
                                </button>
                                <button
                                  onClick={() => handleDeleteSite(site.name)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400 hover:text-red-350 font-bold transition-all text-[11px] cursor-pointer"
                                >
                                  {t.btnDelete}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'backups' ? (
          /* SYSTEM BACKUPS & RESTORE TAB */
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="bg-zinc-900/30 border border-zinc-800/80 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  {t.backupStatusActive}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  {t.backupStatusDesc}
                </p>
              </div>
              <button
                disabled={loadingBackups}
                onClick={handleCreateBackup}
                className="w-full md:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                </svg>
                {t.btnCreateBackup}
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col border border-zinc-800 rounded-2xl bg-zinc-900/10">
              {loadingBackups ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-bold">Syncing backup snapshots...</div>
              ) : backups.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-500 font-bold">No backups registered.</div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className={`w-full border-collapse ${isArabic ? 'text-right' : 'text-left'}`}>
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider bg-zinc-900/40">
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thBackupDate}</th>
                        <th className={`py-3.5 px-4 ${isArabic ? 'text-right' : 'text-left'}`}>{t.thSnapshotId}</th>
                        <th className="py-3.5 px-4 text-center">{t.thStatus}</th>
                        <th className="py-3.5 px-4 text-center w-48">{t.thActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-xs">
                      {backups.map((bk, index) => (
                        <tr key={bk.id} className="hover:bg-zinc-900/30 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            <span dir="ltr">
                              {new Date(bk.timestamp).toLocaleString(isArabic ? 'ar-EG' : 'en-US', {
                                year: 'numeric', month: 'short', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-zinc-400">
                            {bk.customName ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-zinc-200 text-xs font-sans">{bk.customName}</span>
                                <span className="font-mono text-[10px] text-zinc-500">{bk.id}</span>
                              </div>
                            ) : (
                              <span className="font-mono text-[11px]">{bk.id}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${index === 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                              {index === 0 ? t.statusLatest : t.statusArchived}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleRestoreBackup(bk.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-[11px] cursor-pointer"
                              >
                                {t.btnRestore}
                              </button>
                              <button
                                onClick={() => handleDeleteBackup(bk.id)}
                                className="px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400 hover:text-red-350 font-bold transition-all text-[11px] cursor-pointer"
                              >
                                {t.btnDelete}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* IEC AWARENESS MATERIALS TAB */
          <div className="space-y-6 flex-1 flex flex-col">

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.totalIec}</span>
                <span className="text-2xl font-black text-white mt-1">{materials.length}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.pdfLeaflets}</span>
                <span className="text-2xl font-black text-rose-400 mt-1">{pdfCount}</span>
              </div>
              <div className="bg-zinc-900/30 border border-zinc-850 p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">{t.imagesFlyers}</span>
                <span className="text-2xl font-black text-emerald-400 mt-1">{imageCount}</span>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <button
                  onClick={() => openIecModal(null)}
                  className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 p-2 rounded-2xl flex flex-col justify-center items-center text-blue-400 transition-all group cursor-pointer"
                >
                  <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
                  </svg>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-center">{t.addIecBtn}</span>
                </button>
                <a
                  href="/iec-materials"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 p-2 rounded-2xl flex flex-col justify-center items-center text-emerald-400 transition-all group cursor-pointer"
                >
                  <svg className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-center">{isArabic ? 'معاينة الصفحة' : 'Preview Page'}</span>
                </a>
              </div>
            </div>

            {/* List & Search Controls */}
            <div className="bg-zinc-900/20 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder={t.searchIecPlaceholder}
                  value={iecSearch}
                  onChange={(e) => setIecSearch(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                <button
                  onClick={() => setIecCategoryFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${iecCategoryFilter === 'all'
                      ? 'bg-zinc-800 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                >
                  {t.allFormats}
                </button>
                <button
                  onClick={() => setIecCategoryFilter('wash')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${iecCategoryFilter === 'wash'
                      ? 'bg-blue-950/30 text-blue-400 border border-blue-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                >
                  {isArabic ? 'المياه والإصحاح البيئي' : 'WASH & Hygiene'}
                </button>
                <button
                  onClick={() => setIecCategoryFilter('health')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${iecCategoryFilter === 'health'
                      ? 'bg-rose-950/30 text-rose-400 border border-rose-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                >
                  {isArabic ? 'الصحة والوقاية' : 'Health & Infection'}
                </button>
                <button
                  onClick={() => setIecCategoryFilter('protection')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${iecCategoryFilter === 'protection'
                      ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                >
                  {isArabic ? 'الحماية والسلامة' : 'Protection & Safety'}
                </button>
                <button
                  onClick={() => setIecCategoryFilter('vector')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${iecCategoryFilter === 'vector'
                      ? 'bg-orange-950/30 text-orange-400 border border-orange-900/30'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white'
                    }`}
                >
                  {isArabic ? 'مكافحة النواقل والقوارض' : 'Vector Control'}
                </button>
              </div>
            </div>

            {/* IEC Grid List */}
            {loadingIec ? (
              <div className="py-20 text-center text-xs text-zinc-400 font-bold">Loading educational materials...</div>
            ) : filteredIec.length === 0 ? (
              <div className="py-20 text-center text-xs text-zinc-500 font-bold">No materials matches found.</div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredIec.map((item) => (
                  <div key={item.key} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700/80 transition-all relative">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${item.type === 'pdf' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                            {item.type}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 uppercase">
                            {item.category || 'wash'}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-zinc-500">/{item.key}</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 font-mono px-1 rounded">EN</span>
                            {item.translations?.en?.title || 'No title'}
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.translations?.en?.description || 'No description'}</p>
                        </div>

                        <div className="pt-2.5 border-t border-zinc-850/60" dir="rtl">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
                            {item.translations?.ar?.title || 'بدون عنوان'}
                            <span className="text-[9px] bg-blue-500/10 text-blue-400 font-mono px-1 rounded">AR</span>
                          </h4>
                          <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">{item.translations?.ar?.description || 'بدون وصف'}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-zinc-850/40 text-[10px] text-zinc-500 space-y-1 font-mono">
                        <div className="truncate"><span className="text-zinc-600">File:</span> {decodeURIComponent(item.file)}</div>
                        <div className="truncate"><span className="text-zinc-600">Download:</span> {item.downloadName}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5 pt-3.5 border-t border-zinc-850">
                      <button
                        onClick={() => openIecModal(item)}
                        className="flex-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        {t.btnEdit}
                      </button>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-900/30 hover:bg-emerald-900/30 text-emerald-400 text-center text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                      >
                        {isArabic ? 'معاينة' : 'Preview'}
                      </a>
                      <button
                        onClick={() => handleDeleteIec(item.key)}
                        className="flex-1 px-3 py-2 rounded-xl bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        {t.btnDelete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="py-6 border-t border-zinc-900 bg-zinc-950 text-center text-[10px] text-zinc-600">
        {t.footerText.replace('{year}', new Date().getFullYear())}
      </footer>

      {/* COORDINATE MODAL FORM */}
      {isCoordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative">
            <h3 className="text-base font-black text-white mb-4">
              {editingCoord ? t.modalEditCoord.replace('{id}', editingCoord.id) : t.modalAddCoord}
            </h3>

            <form onSubmit={handleSaveCoordinate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblServiceName}</label>

                {/* Combobox for Service Type */}
                <CreatableSelect
                  isClearable
                  options={serviceTypeOptions}
                  onChange={(option) => setCoordForm({ ...coordForm, name: option ? option.value : '' })}
                  value={coordForm.name ? { value: coordForm.name, label: coordForm.name } : null}
                  placeholder={t.lblServiceName}
                  styles={reactSelectStyles}
                  className="w-full text-xs text-white"
                  classNamePrefix="react-select"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblOrg}</label>
                <input
                  type="text"
                  value={coordForm.Org}
                  onChange={(e) => setCoordForm({ ...coordForm, Org: e.target.value })}
                  placeholder="e.g. ACTED"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblSiteName}</label>
                <select
                  value={coordForm['site name']}
                  onChange={(e) => {
                    const site = e.target.value;
                    const inferredLoc = site ? (siteTranslations[site]?.location || 'North') : coordForm.location;
                    setCoordForm({ ...coordForm, 'site name': site, location: inferredLoc });
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 mb-1"
                >
                  <option value="">{isArabic ? 'عامة (غير مرتبطة بموقع)' : 'General (No specific site)'}</option>
                  {uniqueSites.map((s) => {
                    const trans = siteTranslations[s.name] || {};
                    const siteDisplayName = isArabic ? (trans.ar || s.name) : (trans.en || s.name);
                    return (
                      <option key={s.name} value={s.name}>{siteDisplayName} ({s.location})</option>
                    );
                  })}
                </select>
                <div className="text-[10px] text-zinc-500">{t.typeNewSitePrompt}</div>
                <input
                  type="text"
                  value={coordForm['site name']}
                  onChange={(e) => {
                    const site = e.target.value;
                    const inferredLoc = site ? (siteTranslations[site]?.location || 'North') : coordForm.location;
                    setCoordForm({ ...coordForm, 'site name': site, location: inferredLoc });
                  }}
                  placeholder="Type new site name if not listed above"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 mt-1"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{isArabic ? 'المنطقة الجغرافية' : 'Region Location'}</label>
                <select
                  value={coordForm.location}
                  disabled={!!(coordForm['site name'] && siteTranslations[coordForm['site name']])}
                  onChange={(e) => setCoordForm({ ...coordForm, location: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="North">{isArabic ? 'منطقة الشمال (North)' : 'North Region'}</option>
                  <option value="South">{isArabic ? 'منطقة الجنوب (South)' : 'South Region'}</option>
                </select>
                {coordForm['site name'] && siteTranslations[coordForm['site name']] && (
                  <p className="text-[10px] text-zinc-500 mt-1">
                    {isArabic ? 'يتم تحديد المنطقة تلقائيًا بناءً على الموقع المختار' : 'Region is automatically determined by the selected site'}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblLatitude}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={coordForm.latitude}
                    onChange={(e) => setCoordForm({ ...coordForm, latitude: e.target.value })}
                    placeholder="e.g. 31.519358"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblLongitude}</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={coordForm.longitude}
                    onChange={(e) => setCoordForm({ ...coordForm, longitude: e.target.value })}
                    placeholder="e.g. 34.449595"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsCoordModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  {t.btnSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SITES MODAL FORM */}
      {isSiteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white mb-4">
              {editingSite ? t.modalEditSite.replace('{name}', editingSite.name) : t.modalAddSite}
            </h3>

            {siteFormError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {siteFormError}
              </div>
            )}

            <form onSubmit={handleSaveSite} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Metadata */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                      {isArabic ? 'رمز الموقع (المفتاح الأساسي ومفتاح الربط الداخلي)' : 'Site Code (Primary & Internal Key)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={siteForm.code}
                      onChange={(e) => setSiteForm({ ...siteForm, code: e.target.value })}
                      placeholder={isArabic ? 'مثال: KH5452' : 'e.g. KH5452'}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                      {isArabic ? 'رمز المشروع (Project Code)' : 'Project Code'}
                    </label>
                    <CreatableSelect
                      isClearable
                      options={projectCodeOptions}
                      onChange={(option) => setSiteForm({ ...siteForm, projectCode: option ? option.value : '' })}
                      value={siteForm.projectCode ? { value: siteForm.projectCode, label: siteForm.projectCode } : null}
                      placeholder={isArabic ? 'مثال: GNY' : 'e.g. GNY'}
                      styles={reactSelectStyles}
                      className="w-full text-xs text-white text-left"
                      classNamePrefix="react-select"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblSiteNameEng}</label>
                    <input
                      type="text"
                      required
                      value={siteForm.nameEn}
                      onChange={(e) => setSiteForm({ ...siteForm, nameEn: e.target.value })}
                      placeholder="e.g. AL Amal college"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblSiteNameAra}</label>
                    <input
                      type="text"
                      required
                      value={siteForm.nameAr}
                      onChange={(e) => setSiteForm({ ...siteForm, nameAr: e.target.value })}
                      placeholder="مثال: كلية الأمل"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-right font-medium"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblRegion}</label>
                    <select
                      value={siteForm.location}
                      onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                    </select>
                  </div>
                </div>

                {/* Right Column: Boundaries */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                      {isArabic ? 'ملف حدود الموقع (GeoJSON/JSON)' : 'Site Boundary File (GeoJSON/JSON)'}
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="file"
                        accept=".json,.geojson"
                        onChange={handleBoundaryUpload}
                        className="hidden"
                        id="site-boundary-upload"
                      />
                      <label
                        htmlFor="site-boundary-upload"
                        className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer border border-zinc-700 flex items-center gap-2 transition-all"
                      >
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                        </svg>
                        {uploadingBoundary ? (isArabic ? 'جاري الرفع...' : 'Uploading...') : (isArabic ? 'اختر ملف الحدود' : 'Choose Boundary File')}
                      </label>

                      {siteForm.boundaryFile && (
                        <span className="text-emerald-400 font-mono text-[10px] truncate max-w-xs flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 rounded-lg" dir="ltr">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                          Uploaded: {siteForm.boundaryFile.split('/').pop()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-zinc-900/40 p-4 border border-zinc-800/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                        {isArabic ? 'أو أدخل الإحداثيات يدوياً (خطوط الطول, العرض, الارتفاع)' : 'Or Enter Coordinates Manually (Lng, Lat, Ele)'}
                      </label>
                      <span className="text-[9px] text-zinc-500 font-mono">one pair per line</span>
                    </div>
                    <textarea
                      rows={4}
                      value={plainCoordinates}
                      onChange={(e) => setPlainCoordinates(e.target.value)}
                      placeholder={`e.g.\n34.26742,31.360003,0\n34.266474,31.359212,0\n34.267411,31.358588,0`}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono placeholder-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={handleParsePlainCoordinates}
                      disabled={uploadingBoundary || !plainCoordinates.trim()}
                      className="w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-extrabold text-[10px] uppercase tracking-wider rounded-xl border border-blue-500/20 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                    >
                      {isArabic ? 'إنشاء وتطبيق الحدود' : 'Generate & Apply Boundary'}
                    </button>
                  </div>

                  {!editingSite && (
                    <div className="grid grid-cols-2 gap-4 bg-zinc-900/30 p-4 border border-zinc-900 rounded-2xl">
                      <div className="col-span-2 text-[10px] text-zinc-400 leading-normal">
                        {t.sitePlaceholderAlert}
                      </div>
                      <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[9px] mb-1">{t.lblCenterLat}</label>
                        <input
                          type="number"
                          step="any"
                          value={siteForm.latitude}
                          onChange={(e) => setSiteForm({ ...siteForm, latitude: e.target.value })}
                          placeholder="e.g. 31.519358"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[9px] mb-1">{t.lblCenterLng}</label>
                        <input
                          type="number"
                          step="any"
                          value={siteForm.longitude}
                          onChange={(e) => setSiteForm({ ...siteForm, longitude: e.target.value })}
                          placeholder="e.g. 34.449595"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsSiteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  {editingSite ? t.btnSave : t.registerSiteBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IEC MATERIAL MODAL FORM */}
      {isIecModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-black text-white mb-4">
              {editingIec ? t.modalEditIec.replace('{key}', editingIec.key) : t.modalAddIec}
            </h3>

            <form onSubmit={handleSaveIec} className="space-y-4 text-xs">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblSlugKey}</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingIec}
                    value={iecForm.key}
                    onChange={(e) => setIecForm({ ...iecForm, key: e.target.value })}
                    placeholder="e.g. jerry-can-washing"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 disabled:opacity-50 text-left font-mono"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{isArabic ? 'التصنيف' : 'Category'}</label>
                  <select
                    value={iecForm.category}
                    onChange={(e) => setIecForm({ ...iecForm, category: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="health">Health & Infection Prevention / الصحة والوقاية</option>
                    <option value="wash">WASH & Hygiene / المياه والإصحاح البيئي</option>
                    <option value="protection">Protection & Safety / الحماية والسلامة</option>
                    <option value="vector">Vector Control / مكافحة النواقل والقوارض</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblUploadAsset}</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    required={!editingIec && !iecForm.file}
                    accept="application/pdf,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="iec-file-upload"
                  />
                  <label
                    htmlFor="iec-file-upload"
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer border border-zinc-700 flex items-center gap-2 transition-all"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                    </svg>
                    {uploading ? t.lblUploading : t.btnChooseFile}
                  </label>

                  {iecForm.file && (
                    <span className="text-emerald-400 font-mono text-[10px] truncate max-w-xs flex items-center gap-1.5 bg-emerald-950/20 border border-emerald-900/30 px-2.5 py-1.5 rounded-lg" dir="ltr">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                      Uploaded: {iecForm.file.split('/').pop()}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblAssetPath}</label>
                  <input
                    type="text"
                    required
                    readOnly
                    value={iecForm.file}
                    placeholder="Auto-filled / تعبئة تلقائية"
                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-xl px-3.5 py-2.5 text-xs text-zinc-500 outline-none cursor-not-allowed font-mono text-left"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">{t.lblDownloadFilename}</label>
                  <input
                    type="text"
                    value={iecForm.downloadName}
                    onChange={(e) => setIecForm({ ...iecForm, downloadName: e.target.value })}
                    placeholder="e.g. Jerry Can Cleaning Guide.pdf"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Translation Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">

                {/* English Content */}
                <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl" dir="ltr">
                  <h4 className="text-[10px] uppercase font-black text-blue-400 tracking-wider text-left">{t.lblTranslationEn}</h4>

                  <div>
                    <label className="block text-zinc-500 font-bold uppercase text-[9px] mb-1 text-left">{t.lblTitle}</label>
                    <input
                      type="text"
                      required
                      value={iecForm.titleEn}
                      onChange={(e) => setIecForm({ ...iecForm, titleEn: e.target.value })}
                      placeholder="e.g. Cleaning of Jerry Cans"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-500 font-bold uppercase text-[9px] mb-1 text-left">{t.lblDescription}</label>
                    <textarea
                      rows="3"
                      value={iecForm.descriptionEn}
                      onChange={(e) => setIecForm({ ...iecForm, descriptionEn: e.target.value })}
                      placeholder="Brief details about the flyer..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 resize-none text-left"
                    ></textarea>
                  </div>
                </div>

                {/* Arabic Content */}
                <div className="space-y-3 bg-zinc-900/20 border border-zinc-900 p-4 rounded-2xl" dir="rtl">
                  <h4 className="text-[10px] uppercase font-black text-blue-400 tracking-wider text-right">{t.lblTranslationAr}</h4>

                  <div>
                    <label className="block text-zinc-500 font-bold uppercase text-[9px] mb-1 text-right">{t.lblTitle}</label>
                    <input
                      type="text"
                      required
                      value={iecForm.titleAr}
                      onChange={(e) => setIecForm({ ...iecForm, titleAr: e.target.value })}
                      placeholder="مثال: تنظيف جالونات المياه"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 text-right font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-500 font-bold uppercase text-[9px] mb-1 text-right">{t.lblDescription}</label>
                    <textarea
                      rows="3"
                      value={iecForm.descriptionAr}
                      onChange={(e) => setIecForm({ ...iecForm, descriptionAr: e.target.value })}
                      placeholder="تفاصيل موجزة عن المنشور التوعوي..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500 resize-none text-right font-medium"
                    ></textarea>
                  </div>
                </div>

              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsIecModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-bold text-xs cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 cursor-pointer"
                >
                  {t.btnSave}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {confirmModal.isDanger && (
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/30 border border-red-500/20 text-red-500 mb-4">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            )}

            <h3 className="text-base font-black text-white text-center mb-2">
              {confirmModal.title}
            </h3>

            <div className="text-xs text-zinc-400 leading-relaxed mb-6 px-2">
              {confirmModal.message}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-bold text-xs cursor-pointer transition-all"
              >
                {confirmModal.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-lg cursor-pointer transition-all ${confirmModal.isDanger
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/10'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/10'
                  }`}
              >
                {confirmModal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup Naming Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-white mb-2">
              {isArabic ? 'إنشاء نسخة احتياطية جديدة' : 'Create New Backup'}
            </h3>
            
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {isArabic 
                ? 'يرجى إدخال اسم للنسخة الاحتياطية لتسهيل التعرف عليها لاحقًا. أو يمكنك ترك الاسم التلقائي بالوقت الحالي.' 
                : 'Please enter a name for the backup version to easily identify it later. Or keep the automatic current timestamp name.'}
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1.5">
                  {isArabic ? 'اسم النسخة الاحتياطية' : 'Backup Name'}
                </label>
                <input
                  type="text"
                  value={backupCustomName}
                  onChange={(e) => setBackupCustomName(e.target.value)}
                  placeholder={isArabic ? 'مثال: قبل استيراد الخدمات' : 'e.g. Before bulk service import'}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-300 font-bold text-xs cursor-pointer transition-all"
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateBackup(backupCustomName)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
                >
                  {isArabic ? 'إنشاء النسخة' : 'Create Backup'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Site Deletion Options Modal */}
      {deleteSiteModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 p-6 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/30 border border-red-500/20 text-red-500 mb-4">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-base font-black text-white text-center mb-2">
              {isArabic ? 'حذف موقع الخريطة' : 'Delete Map Site'}
            </h3>

            <div className="text-xs text-zinc-400 leading-relaxed mb-6 px-2 text-center">
              {isArabic ? (
                <>
                  هل أنت متأكد من حذف الموقع <strong className="text-red-400">"{siteTranslations[deleteSiteModal.siteName]?.ar || siteTranslations[deleteSiteModal.siteName]?.en || deleteSiteModal.siteName}"</strong>؟
                  <br />
                  يحتوي هذا الموقع على <strong className="text-zinc-200">{deleteSiteModal.count}</strong> من الخدمات المرتبطة به.
                </>
              ) : (
                <>
                  Are you sure you want to delete the site <strong className="text-red-400">"{siteTranslations[deleteSiteModal.siteName]?.en || deleteSiteModal.siteName}"</strong>?
                  <br />
                  This site has <strong className="text-zinc-200">{deleteSiteModal.count}</strong> associated services.
                </>
              )}
            </div>

            {/* List of associated services */}
            {deleteSiteModal.count > 0 && (
              <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-900/20 max-h-36 overflow-y-auto custom-scrollbar mb-6 text-xs text-zinc-400">
                <table className={`w-full ${isArabic ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-zinc-900/60 text-zinc-300 font-bold border-b border-zinc-800 sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-zinc-800">{isArabic ? 'نوع الخدمة' : 'Service Type'}</th>
                      <th className="p-2 border-b border-zinc-800">{isArabic ? 'مزود الخدمة' : 'Service Provider'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850/50">
                    {deleteSiteModal.associatedCoords.map((c, i) => (
                      <tr key={i} className="hover:bg-zinc-900/30">
                        <td className="p-2 font-medium text-zinc-200">{c.name}</td>
                        <td className="p-2 text-zinc-400">{c.Org || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="space-y-3">
              {/* Option 1: Delete Site and Services */}
              <button
                type="button"
                onClick={() => executeDeleteSiteWithServices(deleteSiteModal.siteName)}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/10 cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isArabic ? 'حذف الموقع مع كافة خدماته المرتبطة به' : 'Delete Site & All Associated Services'}
              </button>

              {/* Option 2: Delete Site only, keep services as general */}
              <button
                type="button"
                onClick={() => executeDeleteSiteOnly(deleteSiteModal.siteName)}
                className="w-full py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 hover:border-zinc-650 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isArabic ? 'حذف الموقع فقط وتحويل خدماته إلى خدمات عامة' : 'Delete Site Only & Keep Services (Make General)'}
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setDeleteSiteModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-full py-2.5 rounded-xl border border-zinc-850 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-350 font-bold text-xs cursor-pointer transition-all text-center"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Preview Modal */}
      {previewMapUrl && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10">
          <div className="w-full h-full max-w-7xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-900/50">
              <h3 className="text-base font-black text-white px-2">
                {isArabic ? 'معاينة الموقع على الخريطة' : 'Map Preview'}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewMapUrl(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div className="flex-1 relative w-full h-full">
              <iframe src={previewMapUrl} className="absolute inset-0 w-full h-full border-0" allow="geolocation" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

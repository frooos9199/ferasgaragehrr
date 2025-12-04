# 🔥 Firebase Setup Instructions

## خطوات إعداد Firebase:

### 1️⃣ إنشاء مشروع Firebase:
1. اذهب إلى: https://console.firebase.google.com/
2. اضغط "Add project" أو "إضافة مشروع"
3. اسم المشروع: `hrr-garage` (أو أي اسم تريده)
4. فعّل Google Analytics (اختياري)
5. اضغط "Create project"

### 2️⃣ إعداد Firestore Database:
1. من القائمة الجانبية، اختر "Firestore Database"
2. اضغط "Create database"
3. اختر "Start in **production mode**" (سنعدل القواعد لاحقاً)
4. اختر الموقع: `nam5 (us-central)` أو الأقرب لك
5. اضغط "Enable"

### 3️⃣ إعداد Storage للصور:
1. من القائمة الجانبية، اختر "Storage"
2. اضغط "Get started"
3. اختر "Start in production mode"
4. اختر نفس الموقع السابق
5. اضغط "Done"

### 4️⃣ الحصول على مفاتيح المشروع:
1. اضغط على أيقونة الترس ⚙️ بجانب "Project Overview"
2. اختر "Project settings"
3. انزل للأسفل حتى "Your apps"
4. اضغط على أيقونة الويب `</>`
5. اسم التطبيق: `HRR Garage Web`
6. اضغط "Register app"
7. **انسخ قيم `firebaseConfig`**

### 5️⃣ إضافة المفاتيح إلى المشروع:
افتح ملف `.env.local` في جذر المشروع وضع القيم:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=hrr-garage.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hrr-garage
REACT_APP_FIREBASE_STORAGE_BUCKET=hrr-garage.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 6️⃣ إعداد قواعد الأمان:

#### Firestore Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /jobCards/{cardId} {
      // السماح بالقراءة للجميع (للعملاء عبر QR Code)
      allow read: if true;
      
      // السماح بالكتابة/التعديل/الحذف للمستخدمين المصادق عليهم فقط
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

#### Storage Rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /jobCards/{cardId}/{allPaths=**} {
      // السماح بالقراءة للجميع
      allow read: if true;
      
      // السماح بالرفع للمستخدمين المصادق عليهم فقط
      // حد أقصى 2MB لكل ملف
      allow write: if request.auth != null 
                   && request.resource.size < 2 * 1024 * 1024;
    }
  }
}
```

### 7️⃣ إعداد Authentication (للأدمن):
1. من القائمة الجانبية، اختر "Authentication"
2. اضغط "Get started"
3. اختر "Email/Password"
4. فعّل "Email/Password"
5. احفظ
6. اذهب لـ "Users"
7. اضغط "Add user"
8. Email: `admin@hrr-garage.com`
9. Password: `9199` (أو كلمة سر قوية)
10. اضغط "Add user"

### 8️⃣ تشغيل المشروع:
```bash
npm start
```

### 9️⃣ رفع على Vercel:
1. أضف المتغيرات البيئية في Vercel Dashboard:
   - Settings > Environment Variables
   - أضف كل `REACT_APP_FIREBASE_*` من `.env.local`

2. ارفع المشروع:
```bash
npm run build
vercel --prod
```

---

## ✅ الميزات بعد Firebase:
- ✅ QR Code يعمل على جميع الأجهزة
- ✅ مزامنة تلقائية للبيانات
- ✅ تخزين الصور في السحابة
- ✅ نسخ احتياطي تلقائي
- ✅ دعم عدة مستخدمين
- ✅ أمان وحماية البيانات

---

## 🆘 مساعدة:
إذا واجهت مشكلة:
1. تأكد من صحة المفاتيح في `.env.local`
2. تأكد من إعداد قواعد Firestore و Storage
3. تأكد من إنشاء مستخدم Admin
4. راجع Console للأخطاء

**جاهز للانطلاق!** 🚀

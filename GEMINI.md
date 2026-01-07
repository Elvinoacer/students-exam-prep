
---

# **📚 Student Exam Resource Portal – System Documentation**

## **1\. 🎯 Purpose & Scope**

A simple but scalable platform where:

* Students **access exam preparation resources**  
* Authorized uploaders **manage academic materials**  
* Students can **contribute resources** with attribution  
* Assignments and **solutions are centralized**  
* Content is structured by **Year → Unit → Resources**

---

## **2\. 👥 User Roles**

### **2.1 Viewer (Student)**

* Browse resources  
* Download files  
* View assignments  
* Upload **optional resources or solutions**  
* Provide their **name for attribution**

### **2.2 Main Uploader (Admin / Lecturer / GTSS)**

* Upload all official materials  
* Upload assignments  
* Upload official solutions  
* Manage exam timetable banner  
* Moderate student uploads (optional)

---

## **3\. 🗂️ Content Structure (VERY IMPORTANT)**

Year of Study  
 └── Unit  
     ├── Resources  
     │    ├── PDFs  
     │    ├── DOCX  
     │    ├── PPTs  
     │    ├── ZIPs  
     │    └── YouTube Links  
     │  
     ├── Assignments  
     │    ├── Assignment Files  
     │    ├── Assignment Notes (Text)  
     │    └── Solutions  
     │         ├── Official (GTSS)  
     │         └── Community Submissions

---

## **4\. 📦 File Types Supported**

* `pdf`  
* `docx`  
* `ppt / pptx`  
* `zip`  
* `image (exam timetable)`  
* `youtube links (stored as URLs)`

All files stored in **Vercel Blob**, metadata in **PostgreSQL**.

---

## **5\. 🧱 Core Features Breakdown**

### **5.1 Units Page**

* Exam timetable image shown as **banner**  
* List of units  
* Each unit card:  
  * Unit name  
  * Year of study  
  * Resource count  
  * Assignment count

---

### **5.2 Unit Detail Page**

#### **Sections:**

1. **Resources**  
2. **Assignments**  
3. **Ask to Share a File (Community Upload)**

---

### **5.3 Resources Section**

Each resource displays:

* File name  
* File type  
* Uploaded by:  
  * `GTSS` (static label)  
  * OR `Student Name` (with “Thanks to …” badge)  
* Upload date  
* Download button

---

### **5.4 Assignments Section**

For each assignment:

* Assignment file  
* Notes (rich text / markdown)  
* Upload date

#### **Assignment Solutions:**

* Official solution (GTSS)  
* Community solutions  
  * Contributor name required  
  * “🙏 Thanks to {Name}” label

---

### **5.5 Community Upload Flow (Critical UX)**

When a student uploads:

1. Must enter **name**  
2. Upload file or paste YouTube link  
3. Agree that their name will be displayed  
4. Submission appears immediately or pending approval

---

## **6\. 🧠 Data Model (PostgreSQL – Prisma Style)**

### **6.1 Year**

Year {  
  id  
  name        // e.g. Year 1  
}

### **6.2 Unit**

Unit {  
  id  
  name  
  yearId  
}

### **6.3 Resource**

Resource {  
  id  
  unitId  
  title  
  fileUrl  
  fileType        // pdf, docx, ppt, zip, youtube  
  uploadedBy      // "GTSS" or student name  
  isOfficial      // true for GTSS uploads  
  createdAt  
}

### **6.4 Assignment**

Assignment {  
  id  
  unitId  
  title  
  fileUrl  
  notes           // text / markdown  
  createdAt  
}

### **6.5 AssignmentSolution**

AssignmentSolution {  
  id  
  assignmentId  
  fileUrl  
  uploadedBy  
  isOfficial  
  createdAt  
}

### **6.6 ExamTimetable**

ExamTimetable {  
  id  
  yearId  
  imageUrl  
}

---

## **7\. ☁️ File Storage (Vercel Blob)**

### **Folder Strategy**

/years/{yearId}/units/{unitId}/resources/  
/years/{yearId}/units/{unitId}/assignments/  
/years/{yearId}/units/{unitId}/solutions/  
/timetables/

Store only:

* `fileUrl`  
* `fileType`  
* `metadata` in DB

---

## **8\. 🔐 Upload Permissions**

| Action | Who |
| ----- | ----- |
| Upload resources | Admin \+ Students |
| Upload assignments | Admin only |
| Upload solutions | Admin \+ Students |
| Delete content | Admin only |

---

## **9\. 🧭 Pages & Routes (Next.js App Router)**

/                → Homepage  
/years/\[yearId\]  
/units/\[unitId\]  
/units/\[unitId\]/assignments/\[assignmentId\]  
/upload          → Admin upload page

---

## **10\. 🧩 API Routes (Server Actions or Route Handlers)**

POST /api/upload/resource  
POST /api/upload/assignment  
POST /api/upload/solution  
GET  /api/units  
GET  /api/resources?unitId=

---

## **11\. 🖼️ UI Principles**

* Simple  
* Fast loading  
* Mobile friendly  
* Clear attribution  
* No clutter

Badges:

* 🏷️ **Official (GTSS)**  
* 🙏 **Thanks to {Name}**

---

## **12\. 🚀 MVP vs Future Enhancements**

### **MVP**

* File upload & download  
* Attribution  
* Assignment \+ solutions  
* Exam timetable banner

### **Later (Optional)**

* Likes / upvotes  
* Search by unit or file  
* Moderation queue  
* Authentication  
* Comments

---

## **13\. ⚠️ Key Advice (Important)**

* **Do not overbuild authentication now**  
* **Attribution is enough**  
* Focus on **structure and clarity**  
* You can scale this to multiple departments later

---

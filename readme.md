# WataBlog - Blog Forum Platform

![WataBlog Logo](./next-web/public/watablog_logo.png)

| language | files | code | comment | blank | total |
| :--- | ---: | ---: | ---: | ---: | ---: |
| TypeScript | 132 | 14,893 | 5,504 | 2,362 | 22,759 |
| TypeScript JSX | 113 | 13,833 | 437 | 1,478 | 15,748 |
| Markdown | 5 | 296 | 2 | 106 | 404 |
| PostCSS | 3 | 177 | 0 | 20 | 197 |
| Python | 8 | 176 | 15 | 34 | 225 |
| YAML | 2 | 103 | 0 | 2 | 105 |
| JavaScript JSX | 5 | 72 | 12 | 17 | 101 |
| JSON with Comments | 2 | 52 | 1 | 2 | 55 |
| JavaScript | 3 | 44 | 0 | 5 | 49 |

WataBlog is a full-stack blog and forum platform designed to connect writers, readers, and enthusiasts in meaningful conversations. The platform provides a modern, feature-rich environment for creating and sharing content, engaging in discussions, and discovering new ideas.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Showcase](#showcase)
- [Contributing](#contributing)

## 🏗️ Architecture Overview

The project follows a modern microservices architecture:

1. **Next.js Frontend** (`/next-web`): Responsive web interface with server-side rendering
2. **NestJS Backend** (`/dispatch`): RESTful API service for business logic and data management
3. **Python Services** (`/services`):
   - Text-to-Speech Service: Converting blog content to audio
   - Search Service: Advanced search capabilities using BM25 algorithm

## ✨ Key Features

### User Management
- **Authentication**: Secure login and registration via Auth0
- **User Profiles**: Customizable profiles with avatars and bio
- **Follow System**: Follow other users and keep track of their content
- **Dashboard**: User statistics, analytics, and activity tracking
- **Payment with Momo**: You can use money to get more credit

### Content Creation & Management
- **Rich Post Editor**: Create and edit blog posts with Markdown support
- **Categories & Tags**: Organize content by topics and tags
- **Media Embedding**: Include images and rich media in posts
- **Save for Later**: Bookmark posts to read later
- **Draft System**: Save drafts and publish when ready (not verified)

### Engagement & Interaction
- **Comments & Discussions**: Engage with content through nested comments
- **Like/Dislike System**: Express reactions to posts and comments
- **Notifications**: Real-time notifications for interactions
- **Direct Messaging**: Private communication between users

### Discovery & Search
- **Advanced Search**: Find content by keywords, authors, categories, or tags
- **Personalized Recommendations**: Content suggestions based on user preferences
- **Featured Content**: Highlighting trending and popular posts
- **Text-to-Speech**: Convert blog posts to audio for accessibility

### Administration
- **Admin Dashboard**: Moderate content, manage users, and monitor platform activity
- **Content Verification**: Review and verify posts for quality
- **User Management**: Manage user accounts and permissions
- **Bulk Notifications**: Send announcements to users
- **Credit Editing**: Change account credit, and interval of auto sending credit

## 🛠️ Tech Stack

### Frontend
- **Next.js**: React framework for server-side rendered pages
- **TypeScript**: Type-safe JavaScript
- **Redux Toolkit**: State management
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Component library
- **Framer Motion**: Animations and transitions
- **Auth0**: Authencication Token-based + Oauth 2.0

### Backend
- **NestJS**: Progressive Node.js framework
- **TypeScript**: Type-safe JavaScript
- **MongoDB**: NoSQL database with Mongoose ODM
- **Passport.js**: Authentication middleware
- **JWT**: Token-based authentication

### Services
- **FastAPI**: Python API framework for microservices
- **BM25**: Search ranking algorithm
- **Text-to-Speech**: Audio conversion service
- **NLTK**: Natural Language Processing library
- **Conda**: Environment management for Python services

### DevOps
- **Docker**: Containerization
- **Redis**: Caching
- **Nginx**: Reverse proxy

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Python 3.8+ with Conda
- MongoDB
- Redis (optional, for production)

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/blog_forum_project.git
cd blog_forum_project
```

#### 2. Setup Next.js Frontend
```bash
cd next-web
npm install
```

#### 3. Setup NestJS Backend
```bash
cd ../dispatch
npm install
```

#### 4. Setup Python Services

##### Search Service
```bash
cd ../services/searching
conda env create -f environment.yml
conda activate se104-bm25-search-api
python -m nltk.downloader punkt
```

##### Text-to-Speech Service
```bash
cd ../text2speak
conda env create -f environment.yml
conda activate se104-fastapi-tts
```

### Running the Application

#### 1. Start the NestJS Backend
```bash
cd dispatch
npm run start:dev
```

#### 2. Start the Next.js Frontend
```bash
cd next-web
npm run dev
```

#### 3. Start the Python Services

##### Search Service
```bash
cd services/searching
conda activate se104-bm25-search-api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

##### Text-to-Speech Service
```bash
cd services/text2speak
conda activate se104-fastapi-tts
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Visit `http://localhost:3000` to access the application.

## 📂 Project Structure

```
blog_forum_project/
├── dispatch/              # NestJS Backend
│   ├── src/
│   │   ├── account/       # User authentication and profiles
│   │   ├── blog/          # Blog post management
│   │   ├── mailer/        # Email notification service
│   │   ├── message/       # Direct messaging system
│   │   ├── search/        # Search integration
│   │   └── utils/         # Utility functions
│   └── ...
├── next-web/              # Next.js Frontend
│   ├── public/            # Static assets
│   │   └── showcase/      # Preview images
│   └── src/
│       ├── app/           # Pages and routes
│       ├── components/    # UI components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and configurations
│       └── utils/         # Helper functions
└── services/              # Python Microservices
    ├── searching/         # Search service
    └── text2speak/        # Text-to-Speech service
```

## Diagram

### Architecture
<details>
<summary>Click to view Architecture</summary>
<img src="./next-web/public/showcase/diagram/architecture.png" alt="Architecture">
</details>

### Database
<details>
<summary>Click to view Database</summary>
<img src="./next-web/public/showcase/diagram/database.png" alt="Database">
</details>

### Components
<details>
<summary>Click to view Components</summary>
<img src="./next-web/public/showcase/diagram/component.png" alt="Components">
</details>

### Routing
<details>
<summary>Click to view Routing</summary>
<img src="./next-web/public/showcase/diagram/route.png" alt="Routing">
</details>


## 📸 Showcase

### Landing Page
<details>
<summary>Click to view Landing Page</summary>
<img src="./next-web/public/showcase/landing_page.png" alt="Landing Page">
</details>

### Homepage, Notification
<details>
<summary>Click to view Homepage</summary>
<img src="./next-web/public/showcase/home_page.png" alt="Homepage">
<p><em>You will also receive email from notification</em></p>
</details>

### Article View
<details>
<summary>Click to view Article View</summary>
<img src="./next-web/public/showcase/example_artical_maxinforl.png" alt="Article Detail">
</details>

### Markdown and Comment Example
<details>
<summary>Click to view Markdown and Comment Example</summary>
<img src="./next-web/public/showcase/example_markdown_comment.png" alt="Markdown and Comment">
<img src="./next-web/public/showcase/commentedit.png" alt="Comment Edit">
</details>

### Search Interface
<details>
<summary>Click to view Search Interface</summary>
<img src="./next-web/public/showcase/search_showcase.png" alt="Search Feature">
</details>

### Admin Dashboard
<details>
<summary>Click to view Admin Dashboard</summary>
<img src="./next-web/public/showcase/example_admin_page.png" alt="Admin Interface">
<img src="./next-web/public/showcase/admin_user.png" alt="Admin User">
<img src="./next-web/public/showcase/admin_credit.png" alt="Admin Credit">
</details>

### Account Dashboard
<details>
<summary>Click to view Account Dashboard</summary>
<img src="./next-web/public/showcase/dashboard1.png" alt="Dashboard 1">
<img src="./next-web/public/showcase/dashboard2.png" alt="Dashboard 2">
</details>

### Edit Profile
<details>
<summary>Click to view Edit Profile</summary>
<img src="./next-web/public/showcase/editprofile.png" alt="Edit Profile">
</details>

### Credit System
<details>
<summary>Click to view Credit System</summary>
<img src="./next-web/public/showcase/payment.png" alt="Payment">
</details>

### Payment with Momo
<details>
<summary>Click to view Payment with Momo</summary>
<img src="./next-web/public/showcase/payment2.png" alt="Payment 2">
<img src="./next-web/public/showcase/payment3.png" alt="Payment 3">
</details>

### Message
<details>
<summary>Click to view Message</summary>
<img src="./next-web/public/showcase/message.png" alt="Message">
</details>

### Saved Post
<details>
<summary>Click to view Saved Post</summary>
<img src="./next-web/public/showcase/savedpost.png" alt="Saved Post">
</details>

### Text2Speech
<details>
<summary>Click to view Text2Speech</summary>
<img src="./next-web/public/showcase/text2speech.png" alt="Text2Speech">
</details>

### Follow
<details>
<summary>Click to view Follow</summary>
<img src="./next-web/public/showcase/follow.png" alt="Follow">
<p><em>Followed account will receive credit from follower account in an interval of time</em></p>
</details>

### Profile Page
<details>
<summary>Click to view Profile Page</summary>
<img src="./next-web/public/showcase/profilepage.png" alt="Profile Page">
</details>

### Edit Post
<details>
<summary>Click to view Edit Post</summary>
<img src="./next-web/public/showcase/editpost.png" alt="Edit Post">
<p><em>You can create, edit, and remove post (if you're admin or author, and must be a verified account)</em></p>
</details>

### Default Page
<details>
<summary>Click to view Default Page</summary>
<img src="./next-web/public/showcase/defaultpage.png" alt="Default Page">
</details>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 Licens

---

Built with ❤️ by Trungdangtapcode
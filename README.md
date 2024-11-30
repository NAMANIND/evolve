# Fitness Tracker App 🏃‍♂️

A mobile application for tracking workouts and recording exercise videos. Built with Expo (React Native) and Node.js.

## Tech Stack 🛠

### Mobile App
- Expo (React Native)
- React Context API
- Expo Camera
- Zod for validation
- AsyncStorage

### Backend
- Node.js & Express
- MongoDB
- AWS S3 for video storage
- Docker & Docker Compose

### DevOps
- GitHub Actions
- Docker Hub
- AWS EC2 (Self-hosted runner)

## Project Structure 📁

```
├── mobile/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   ├── App.js
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
│
└── docker-compose.yml
```

## Setup & Installation 🚀

### Prerequisites
- Node.js 18+
- Expo CLI
- Docker & Docker Compose
- AWS Account
- MongoDB Atlas

### Backend Setup
1. Clone repository
```bash
git clone https://github.com/yourusername/fitness-tracker.git
cd fitness-tracker/backend
```

2. Create .env file
```env
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region
AWS_BUCKET_NAME=your_bucket
```

3. Local development
```bash
npm install
npm run dev
```

4. Docker development
```bash
docker-compose up
```

### Mobile App Setup
1. Navigate to mobile directory
```bash
cd ../mobile
```

2. Install dependencies
```bash
npm install
```

3. Start Expo
```bash
npx expo start
```

## Deployment 🌐

### CI/CD Pipeline
The project uses GitHub Actions for automated deployment:
- Builds Docker image on push to main
- Pushes to Docker Hub
- Deploys to EC2 using self-hosted runner

### Environment Variables
Required secrets in GitHub repository:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `MONGODB_URI`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

### Fitness Tracker App Architecture Diagram
![image](https://github.com/user-attachments/assets/f4f589f7-9dde-40fa-830b-d8bc1683fe77)


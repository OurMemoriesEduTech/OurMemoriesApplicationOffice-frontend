# Our Memories Application Office - Frontend

A comprehensive educational platform frontend built with React, Vite, and Bootstrap that provides students with tools for university applications, course qualification checking, digital prospectuses, and administrative management.

## Features

### For Students
- **Application Portal**: Submit applications for universities, TVET colleges, and bursaries
- **Course Qualification Checker**: Check which courses you qualify for based on your matric results
- **Digital Prospectuses**: Browse university and college prospectuses digitally
- **Payment Integration**: Secure payment processing with Stripe
- **Application Tracking**: View and edit submitted applications

### For Administrators
- **Dashboard**: Overview of applications and system statistics
- **Application Management**: Review, process, and manage student applications
- **User Management**: Manage user accounts and permissions
- **Announcements**: Create and manage system announcements
- **Document Processing**: Handle application documents and downloads

## Tech Stack

- **Frontend Framework**: React 19.1.1 with Vite
- **Styling**: Bootstrap 5.3.8 with custom CSS
- **Routing**: React Router DOM 7.9.1
- **HTTP Client**: Axios 1.12.2
- **Payment Processing**: Stripe React SDK
- **PDF Generation**: React PDF 10.1.0
- **Icons**: React Icons 5.5.0
- **Animations**: Framer Motion 12.23.24
- **Date Handling**: date-fns 4.1.0

## Project Structure

```
src/
├── components/
│   ├── common/           # Shared components (auth, FeatureCard)
│   ├── layout/           # Layout components (Header, Footer)
│   ├── pages/            # Page components (Dashboard, About, Contact)
│   └── features/         # Feature-specific components
│       ├── admin/        # Admin functionality
│       ├── applicationPortal/  # Application submission
│       ├── coursesYouQualify/  # Course qualification checker
│       ├── digitalProspectuses/ # Digital prospectuses viewer
│       └── payment/      # Payment components
├── context/              # React context providers
├── hooks/                # Custom React hooks
└── assets/               # Static assets (images, styles)
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ourmemoriesedusmart-frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## API Integration

The frontend communicates with a backend API. Key endpoints include:

- `GET /api/user/applications` - Fetch user applications
- `POST /api/user/applications` - Submit new applications
- `PUT /api/user/applications/{id}` - Update applications
- `GET /api/admin/applications` - Admin application management
- `POST /api/auth/login` - User authentication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact the development team or create an issue in the repository.

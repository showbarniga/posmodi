# Stackly POS - Technology Stack

## Programming Languages

### Backend
- **Python 3.10+**: Main application language
- **Flask Framework**: Web application framework for routing and templating

### Frontend
- **HTML5**: Semantic markup with Jinja2 templating
- **CSS3**: Custom styling with responsive design
- **JavaScript (ES6+)**: Client-side interactivity and AJAX

## Core Dependencies

### Web Framework
```
Flask>=2.3.0,<4.0          # Core web framework
flask-cors>=4.0.0          # Cross-origin resource sharing
```

### Data Processing
```
pandas>=2.0.0              # Data manipulation and analysis
openpyxl>=3.1.0           # Excel file processing
```

### PDF Generation
```
reportlab>=4.0.0          # PDF document generation
```

### HTTP Client
```
requests>=2.28.0          # HTTP requests for external APIs
```

### Configuration
```
python-dotenv>=1.0.0      # Environment variable management
```

## Development Environment

### Python Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Configuration
Create `.env` file with:
```
SECRET_KEY=your-secret-key
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
APP_BASE_URL=http://127.0.0.1:5000
OTP_EXPIRY_MINUTES=1
```

### Running the Application
```bash
# Development server
python app.py

# Production deployment
# Use WSGI server like Gunicorn
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## Data Storage

### File-based Storage
- **JSON Files**: Primary data persistence
- **No Database Required**: Simplified deployment
- **File System**: Local file storage for uploads

### Data Files Structure
```
users.json              # User authentication data
product.json            # Product catalog
customer.json           # Customer database
quotation.json          # Sales quotations
[entity]_[attribute].json # Master data files
```

## Security Technologies

### Authentication
- **Flask Sessions**: Server-side session management
- **OTP Verification**: Email-based two-factor authentication
- **Password Hashing**: Secure password storage (implementation needed)

### Input Validation
- **Regex Patterns**: Email, phone, name validation
- **SQL Injection Prevention**: Pattern detection
- **XSS Protection**: Script content filtering
- **File Upload Security**: Extension and content validation

### Rate Limiting
- **In-memory Counters**: OTP and login attempt tracking
- **Time-based Windows**: Sliding window rate limiting
- **IP-based Restrictions**: Failed attempt lockouts

## Email Integration

### SMTP Support
- **Gmail**: smtp.gmail.com:587
- **Outlook**: smtp.live.com:587
- **Yahoo**: smtp.mail.yahoo.com:587
- **Custom SMTP**: Configurable server settings

### Email Features
- **OTP Delivery**: Account verification
- **Password Reset**: Secure reset links
- **Quotation Delivery**: PDF attachments
- **HTML Templates**: Professional email formatting

## File Processing

### Excel Operations
- **Template Generation**: Dynamic Excel templates with validation
- **Bulk Import**: Data validation and processing
- **Data Export**: Formatted Excel downloads
- **Cell Validation**: Dropdown lists and data types

### PDF Generation
- **ReportLab**: Professional document generation
- **Custom Templates**: Branded quotations and delivery notes
- **Table Formatting**: Structured data presentation
- **Font Support**: Custom font embedding

### Image Handling
- **Upload Processing**: Secure file uploads
- **Format Support**: JPG, PNG, GIF
- **Size Validation**: File size limits
- **Storage Management**: Organized file structure

## Frontend Technologies

### CSS Framework
- **Custom CSS**: No external CSS frameworks
- **Responsive Design**: Mobile-first approach
- **CSS Grid/Flexbox**: Modern layout techniques
- **Custom Components**: Reusable UI elements

### JavaScript Features
- **Vanilla JavaScript**: No external JS frameworks
- **AJAX Requests**: Dynamic data loading
- **Form Validation**: Client-side validation
- **DOM Manipulation**: Interactive UI updates

### UI Components
- **Modal Dialogs**: User interactions
- **Data Tables**: Sortable and filterable tables
- **Form Controls**: Custom styled inputs
- **Notification System**: Success/error messages

## API Architecture

### RESTful Design
- **HTTP Methods**: GET, POST, PUT, DELETE
- **JSON Responses**: Structured API responses
- **Error Handling**: Consistent error format
- **Status Codes**: Proper HTTP status usage

### Content Negotiation
- **Accept Headers**: HTML vs JSON responses
- **Query Parameters**: Format specification
- **Request Detection**: API vs Web requests

## Development Tools

### Code Quality
- **Linting**: .hintrc configuration
- **Git**: Version control with .gitignore
- **Documentation**: Inline comments and docstrings

### Debugging
- **Flask Debug Mode**: Development debugging
- **Console Logging**: Error tracking
- **Exception Handling**: Graceful error recovery

## Deployment Considerations

### Production Setup
- **WSGI Server**: Gunicorn or uWSGI
- **Reverse Proxy**: Nginx for static files
- **SSL/TLS**: HTTPS encryption
- **Environment Variables**: Secure configuration

### Scalability
- **File-based Storage**: Consider database migration for scale
- **Session Storage**: Redis for distributed sessions
- **File Uploads**: Cloud storage integration
- **Email Service**: External email service providers

### Monitoring
- **Log Management**: Centralized logging
- **Error Tracking**: Exception monitoring
- **Performance Monitoring**: Response time tracking
- **Health Checks**: Application status monitoring

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **ES6+ Support**: Modern JavaScript features
- **CSS3 Support**: Advanced styling features
- **Responsive Design**: Mobile and tablet support
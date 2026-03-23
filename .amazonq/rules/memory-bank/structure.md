# Stackly POS - Project Structure

## Directory Organization

### Root Level Files
```
├── app.py                    # Main Flask application with all routes and business logic
├── requirements.txt          # Python dependencies
├── .env                     # Environment variables (email, SMTP settings)
├── .gitignore              # Git ignore patterns
├── .hintrc                 # Code linting configuration
```

### Data Storage (JSON Files)
```
├── users.json              # User accounts and authentication data
├── roles.json              # System roles and permissions
├── departments.json        # Organizational departments
├── product.json            # Product catalog and inventory
├── customer.json           # Customer database
├── quotation.json          # Sales quotations
├── bills.json              # Billing records
├── sales_orders.json       # Sales order management
├── deliverynotes.json      # Delivery documentation
├── new-enquiry.json        # Customer enquiries
├── enquiry_product.json    # Products linked to enquiries
├── comments.json           # System comments and notes
├── email_otps.json         # OTP verification data
├── failed_attempts.json    # Login failure tracking
```

### Product Master Data Files
```
├── product_categories.json  # Product categories and types
├── product_colors.json     # Available product colors
├── product_sizes.json      # Product size options
├── product_suppliers.json  # Supplier information
├── product_tax_codes.json  # Tax codes and rates
├── product_uoms.json       # Units of measurement
├── product_warehouses.json # Warehouse locations
```

### Custom Configuration
```
├── custom_dropdowns.json   # Dynamic dropdown options
```

### Frontend Assets
```
├── static/                 # Static web assets
│   ├── fonts/             # Custom fonts (DejaVu Sans)
│   ├── images/            # Application images and icons
│   ├── uploads/           # User uploaded files (product images, attachments)
│   ├── *.css             # Page-specific stylesheets
│   └── *.js              # Page-specific JavaScript files
```

### HTML Templates
```
├── templates/             # Jinja2 HTML templates
│   ├── index.html        # Login page
│   ├── dashboard.html    # Main dashboard
│   ├── signup.html       # User registration
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── check-your-mail.html
│   ├── manage-users.html
│   ├── create-user.html
│   ├── department-roles.html
│   ├── create-department.html
│   ├── create-role.html
│   ├── products.html
│   ├── create-new-product.html
│   ├── import-product.html
│   ├── customer.html
│   ├── customer-addnew-customer.html
│   ├── import-customer.html
│   ├── enquiry-list.html
│   ├── new-enquiry.html
│   ├── add-new-quotation.html
│   ├── quotation.html
│   ├── quick-billing.html
│   ├── sales-order.html
│   ├── sales-new.html
│   ├── delivery-note.html
│   ├── deliverynote-new.html
│   ├── profile.html
│   └── menu.html
```

### Documentation
```
├── docs/                  # API and user documentation
│   ├── API_ENDPOINTS.md   # REST API documentation
│   └── Quick_Billing_API_Postman_Guide.md
```

### File Attachments
```
├── attachments/           # System file attachments
│   ├── metadata.json     # Attachment metadata
│   └── *.png, *.jpg      # Uploaded attachment files
```

### Memory Bank (AI Context)
```
├── .amazonq/
│   └── rules/
│       └── memory-bank/   # AI assistant context files
```

## Core Components

### Application Architecture
- **Single-file Flask App**: All routes and business logic in `app.py`
- **JSON-based Storage**: File-based data persistence for simplicity
- **Template-driven UI**: Server-side rendered HTML with Jinja2
- **AJAX Integration**: JavaScript for dynamic interactions

### Data Layer
- **JSON Files**: Primary data storage mechanism
- **File-based Sessions**: Flask session management
- **Upload Handling**: Secure file upload with validation
- **Import/Export**: Excel-based bulk data operations

### Security Layer
- **Session Management**: Automatic timeout and validation
- **Input Validation**: Comprehensive data validation
- **SQL Injection Prevention**: Pattern detection and blocking
- **XSS Protection**: Script content filtering
- **Rate Limiting**: OTP and login attempt restrictions

### Business Logic Modules

#### Authentication & Authorization
- User registration with OTP verification
- Login/logout with session management
- Password reset via email
- Role-based access control

#### Masters Management
- Product catalog with categories and attributes
- Customer database with credit management
- User and role administration
- Department and organizational structure

#### Sales & CRM
- Enquiry tracking and management
- Quotation generation with PDF export
- Quick billing for retail sales
- Sales order processing
- Delivery note generation

#### Data Management
- Excel template generation
- Bulk import with validation
- Data export capabilities
- Duplicate detection and prevention

## Architectural Patterns

### MVC-like Structure
- **Model**: JSON file handlers and data validation functions
- **View**: Jinja2 templates with responsive CSS
- **Controller**: Flask routes in app.py handling business logic

### API Design
- **RESTful Endpoints**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Content Negotiation**: Support for both HTML and JSON responses
- **Error Handling**: Consistent error response format
- **Pagination**: Built-in pagination for large datasets

### File Organization
- **Page-specific Assets**: Each page has dedicated CSS and JS files
- **Modular Templates**: Reusable template components
- **Centralized Configuration**: Environment-based settings
- **Structured Data**: Organized JSON schema for different entities

## Integration Points

### Email System
- SMTP configuration for multiple providers
- OTP delivery for verification
- Quotation delivery to customers
- Password reset notifications

### File Processing
- Excel import/export with openpyxl
- PDF generation with ReportLab
- Image upload and processing
- Template-based data validation

### Frontend Integration
- AJAX calls for dynamic updates
- Form validation and submission
- Real-time feedback and notifications
- Responsive design for multiple devices
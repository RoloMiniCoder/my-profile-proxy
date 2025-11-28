-- Connect to the 'myprofile' database (assuming you are currently using a different one)
\c myprofile

-- Insert 5 sample posts into the 'posts' table
INSERT INTO posts (title, post_type, content_body, thumbnail_url) VALUES
(
    'Currently Reading: The Martian',
    'books',
    'I just started Andy Weir''s fantastic novel, **The Martian**. The engineering problem-solving is brilliant. 
    
Here is a quote I love:
> "I''m going to have to science the shit out of this." 
    
I plan to write a full review soon!',
    '/uploads/book_martian.jpg'
),
(
    'Project Update: Custom Router in React',
    'tech',
    'I''ve been working on a custom, lightweight routing solution for my React SPA to handle nested routes more cleanly than some popular libraries.
    
The core idea is based on the **Context API**.
    
```javascript
    // Example of the main routing logic
    const { path, component: Component } = routes.find(r => r.path === currentPath) || {};
    return Component ? <Component /> : <NotFound />;
```
    
Check out the progress on my GitHub!',
    '/uploads/project_router.png'
),
(
    'A Note on PostgreSQL JSONB',
    'notes',
    'For anyone working with PostgreSQL, the **JSONB** datatype is incredibly powerful. It allows you to store and query JSON data natively, which is perfect for flexible metadata that doesn''t fit a strict relational schema.',
    NULL -- No thumbnail image for this post
),
(
    'A Short Reflection on Self-Hosting',
    'notes',
    'The decision to **self-host** my site has given me a lot more control and a great excuse to learn more about network security and Linux server administration on my Ubuntu machine. It''s definitely worth the effort!',
    NULL
),
(
    'My Favorite Software Engineering Principle',
    'tech',
    'The **D.R.Y. (Don''t Repeat Yourself)** principle is a cornerstone of maintainable code. 
    
I try to apply this not just to functions, but to configuration and infrastructure as well. It saves so much time down the road.',
    '/uploads/principle_dry.gif'
);
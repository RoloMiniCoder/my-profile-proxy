-- Connect to the 'myprofile' database (assuming you are currently using a different one)
\c myprofile

-- Insert 5 sample posts into the 'posts' table
INSERT INTO posts (title, post_type, content_body, thumbnail_url) VALUES
(
    'A musical year''s wrap up.',
    'music',
    'Tidal''s 2025 Rewind has arrived, in clear competition with Spotify''s, hehe.

[Here](https://rewind.tidal.com/2025/c0b41f8b-2ce0-42c2-8a2e-7b386f8abd70)''s mine if you want to take a look, by the way!

Having only changed over to Tidal in October, it is still fun to have a glance at what has been playing over and over on my speakers for the last couple of months, and I guess Enter Shikari have firmly marked their spot as one of my favorite bands ever.

Maybe their spot is no surprise, given that after not having set foot in any music shows over the last 8 years or so, theirs was the first one I went to, this November 7th.

![Me wearing an Enter Shikari jacket](http://192.168.10.178:3001/images/shikari-jacket.jpg)

As for that night, what an amazing gig. I guess I''m never getting over the shock of finally seeing musicians that you''ve known for a while in the flesh.

Kind of an "Oh. They really do exist after all!"',
    '/uploads/book_martian.jpg'
),
(
    'Currently Reading: The Martian',
    'books',
    'I just started Andy Weir''s fantastic novel, **The Martian**. The engineering problem-solving is brilliant. 
    
Here is a quote I love:
> "I''m going to have to science the shit out of this." 
    
I plan to write a full review soon!
![This is a test image!](http://localhost:3001/images/test.jpg)',
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

![This is a test image!](http://localhost:3001/images/test.jpg)
![This is a test image!](http://localhost:3001/images/test.jpg)
![This is a test image!](http://localhost:3001/images/test.jpg)
    
Check out the progress on my GitHub!',
    '/uploads/project_router.png'
),
(
    'A Note on PostgreSQL JSONB',
    'notes',
    'For anyone working with PostgreSQL, the **JSONB** datatype is incredibly powerful.

![This is a non existing image](http://localhost:3001/images/fake.jpg)

It allows you to store and query JSON data natively, which is perfect for flexible metadata that doesn''t fit a strict relational schema.',
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
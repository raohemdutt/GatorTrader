Hello,

So in general, the way this is formatted and the way i set it up to run was in vscode. With vscode, I have a live server extension that allows for me to look at and update the webpages as I work on it. 
https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

Next, I got the original main.css style sheet from a website that is linked on all our pages. It had ~3000 lines of code and I really didnt end up using any of it tbh, but if you scroll to the bottom there is about a 100 line gap, below that is where i started most of my work. 
I created many classes for the objects I use in the code, and you can see them and link them to their appropriate html files. Most of the code in there is done straight through html and css in <script> sections.

If were trying to sync the database, Im not entirely sure how we can do that without actually publishing the pages because supabase is online. Regardless, In login.html you can see the area on line 40 where it changes to script. All the changes and connections we need to make should be there.
As for signup.html, youll likely have adjust some of the logic on line 49 to line 66, as it should work correctly, but we want to ensure everything goes through, it takes a valid uf email, etc. The old .js file I had was useless so i scrapped it. 

If theres anything thats unclear, let me know and ill see if I can take a crack at it or figure it out.

Thanks.

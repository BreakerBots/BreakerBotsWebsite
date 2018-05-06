# Breakersite
The Official Breakerbots Website Hosted Through Firebase and Themed Through Bootstrap 4

## Faces
The Breakersite is layed out into faces, first there is public face targeted at giving general and some specific information about the Breakerbots to people. Then there is the private face targeted at increasing the productivity the Breakerbots' members.

## Public Face
The Public face is landing page for [breakerbots.com](breakerbots.com).
It is divided up into six sections: the main page, about us, our members, our process, past and present robots and the contact. All of these sections are easily accessible through the header at the top of the page.
Along with this there is a portal section in header used for taking team members over to the private face.

## Private Face
The private face is a tool for team members meant for increasing productivity. Before we had used slack, github,  google sheets (for ordering parts), trello, and google calendar. Switching between these apps was fine, but led only a few people undering standing our BOMs (Bill Of Materials)  on google sheets and almost no one using trello. To fix this we started the private face of the Breakersite. The Breakersite is used to replace BOMs through a part management system and replace Trello through a todo list system. Along with that it tracks progress through github, syncing it with the todo system, shows calendar events and implements part slack.

To enter the private face, members must first create account with special key. This account is then registered through the database and Firebase. Now the user is rerouted to the private and can sign in with this account later. Here the user can travel through the tabs and edit their account. The user can link there slack and github accounts for integration with with the todo list. Members can also join teams (like Programming, Mechanical, CAD, etc.). After joining teams members will now recieve notifications and tasks according to that team. Though since this user not verified through a team lead or mentor, they have clearance of 0 and are have limited edit access to the PMS (Part Management System) and TLS (Todo List System).

The Private Face is divided up into tabs: General, Parts (All, Ordered, Archived), Todo, Calendar, Github and Account.
- General
The General Tab gives quick information to team members, it is also the landing page for the private face.

- Parts
The PMS is complex system organized into projects. Each Project has a name, history and parts. Parts can be added edited, deleted, and status marked. Each part has optional values and necessary values including: name, desc, part number, quantity, unit, price per unit, url and urgency/priority. Each project displays their items along with their values, options, and corresting highlight color. Items that are arrrived are crossed out, ordered items are green, and ready and not ready items are highlighted acording to their urgency/priority (Low: None, Med: Slightly Red, High: Red).
    - All
    The parts-all tab displays all of the present projects. 
    - Ordered
    The parts-ordered tab displays a list of all the items that have been ordered.
    - Archived
    The parts-archived tab shows all the past projects.
    
- Todo
The TLS system is a easily accessible system used for organization of tasks. Inside the tab first you will see yearfolders, yearfolders contain all of the projects and project-groups from that year. Inside of the yearfolder are projects and project-groups. Project-groups are basically folders containing project, and can be nested up to 50 times. Inside Each Project are three columns ( Todo, In Progress and Done ). Each Column then contains notes/tasks that have a corresponding team or member to handle them. Each Note/Task, Project, Project-Group and Yearfolder have a title and description.

- Calendar
The Calendar Tab displays all of the events from the google calendar. It is running a custom display of the google calendar through fullcalendar as the embedded google calendar is umm... not good.

- Github
The github tab shows recent commits from all of the breakerbots repositories along with the history of contributions to the all of the organization repositories throughout the year.

- (Unlisted) Account
The Account Tab is unlisted as it takes in a custom parameter of the user are viewing. If you click to view your own account that parameter is set to "this" and then lets you edit your account. Otherwise it will pull user data down from the database according to the custom parameter. 


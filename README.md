# Breakersite
The Official Breakerbots Website Hosted Through Firebase and Themed Through Bootstrap 4

## Faces
The Breakersite is layed out into faces: A public face targeted at giving general information about the Breakerbots to people and a private face for Breakerbots' member use.

## Public Face
The Public face will be the landing page for [breakerbots.com](breakerbots.com).
It is divided into six sections: about, robots, recognition, upcoming event, sponsors, and contact. All of these sections are easily accessible through the header at the top of the page.

In addition, a team blog as well as information about the Central Coast Regional is available. 

Along with this there is a portal section in the header to bring team members to the private face.

## Private Face
The private face is a tool for team members meant for increasing productivity. Before we had been using slack, github, google sheets (for ordering parts), trello, and google calendar. Switching between these apps worked well enough, but only a few people used and understood each site depending on its primary function. To fix this we started the private face of the Breakersite. The Breakersite is designed to replace spreadsheet BOMs through a part management system, sync progress and replicate the functions of Trello with a todo list system, track progress through GitHub, and show calendar events.

To enter the private face, members must first create an account with aspecial key. This account is then registered through the database and Firebase. After signing in, the user can navigate through the tabs and edit their account. The user can link their slack and github accounts for integration with the todo list. Members can also join teams (like Programming, Mechanical, CAD, etc.) to receive notifications and tasks according to that team. Clearance to edit the Parts Management System or ToDo List System can be obtained through verification by team leads or mentors.

The Private Face is divided into the following tabs: General, Parts, Todo, Calendar, Github, Teams and Account (Unlisted).

- General
The General Tab is the landing page for the private face and gives general information to team members.

- Parts
The Part Management System is a complex system organized into projects. Each Project has a name, history and parts. Parts can be added, edited, deleted, and updated. Each part has optional values and necessary values including: name, desc, part number, quantity, unit, price per unit, url and urgency/priority. Each project displays items along with their values, options, and corresting highlight color. Items that have arrrived are crossed out, ordered items are green, and ready and not ready items are highlighted acording to their urgency/priority (Low: None, Med: Light Red, High: Red). The Part Management System is divided up into sub-tabs: All, Ordered and Archived.
    - All
    Displays all of the present projects. 
    - Ordered
    Displays a list of all the items that have been ordered.
    - Archived
    Shows all past projects.
    
- Todo
The TLS system is an easily accessible system used for organization of tasks. Organization is by "yearfolders," which contain all of the projects and project-groups from that year. Project-groups are folders containing projects, and can be nested up to 50 times. Inside each Project, three columns ( Todo, In Progress and Done ) each contain notes/tasks that have a corresponding team or member to handle them. Each Note/Task, Project, Project-Group and Yearfolder have a title and description. When a project is being created it can optionally be assigned to a github repository's project in order to create integration between the Breakersite database and the Github API through the Breakersite Github App.

- Calendar
The Calendar Tab displays all of the events from the google calenda, running a custom display of the google calendar through fullcalendar.

- Github
The Github tab can serve as a quick checkin on the programming team and their progress. To achieve this the tab shows recent commits from all of the breakerbots repositories, current tasks for the programming team, and history of contributions to  all of the organization repositories throughout the year in multiple graphs.

- (Unlisted) Account
The Account Tab is unlisted as it takes in a custom parameter. If you click to view your own account that parameter is set to "this" and then lets you edit your account; otherwise it will pull user data from the database according to the custom parameter. 


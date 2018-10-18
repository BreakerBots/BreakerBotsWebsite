# BreakerSite
The BreakerBots Robotics Team website.

## Deploying Website
- Make sure to have the gcloud console tools downloaded
- Go to this repository in the command line
- Run `gcloud app deploy`
- You can also run the website locally with `npm start`

## Deploying Functions
- Make sure to have the gcloud console tools downloaded
- Go to the functions folder of this repository in the command line
- Run `gcloud functions deploy <function name> --runtime nodejs6 --trigger-http` (Replace `<function-name>` with the name of the function you want to deploy) 
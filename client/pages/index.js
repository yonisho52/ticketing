import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {

  return currentUser ? <h1>You Are sign in</h1> : <h1>you are not sign in</h1>
};

LandingPage.getInitialProps = async (context) => {
  console.log('landing page');
     const client = buildClient(context);
     const { data } = await client.get("/api/users/currentuser");

     return data;
};

export default LandingPage;

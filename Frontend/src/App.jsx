import { BrowserRouter as Router } from "react-router-dom";
import AuthState from './Context/Authentication/AuthState';
import AnimatedRoutes from './Routes/AnimatedRoutes';
import OrgsState from "./Context/Organization/OrgsState";
import PlansState from "./Context/Plans/PlansState";
import ProfileState from "./Context/Profile/ProfileState";
import ServicesState from "./Context/Services/ServicesState";
import PublicState from "./Context/Public/PublicState";
import ActivityState from "./Context/AdminActivitys/ActivityState";
import SupportState from "./Context/Support/SupportState";
import Layout from "./Components/Layout";

function App() {

  return (
    <>
      <SupportState>
        <ActivityState>
          <PublicState>
            <ServicesState>
              <ProfileState>
                <PlansState>
                  <OrgsState>
                    <AuthState>
                      <Router>
                        <Layout>
                          <AnimatedRoutes />
                        </Layout>
                      </Router>
                    </AuthState>
                  </OrgsState>
                </PlansState>
              </ProfileState>
            </ServicesState>
          </PublicState>
        </ActivityState>
      </SupportState>
    </>
  )
}

export default App

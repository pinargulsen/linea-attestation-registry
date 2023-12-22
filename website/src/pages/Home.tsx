import veraxLogo from "../assets/verax-logo-circle.svg";
import "./Home.css";
import { type FunctionComponent, useEffect } from "react";

export type HomeProps = {
  title: string;
};

export const Home: FunctionComponent<HomeProps> = ({ title }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="container">
      <div>
        <a href="https://docs.ver.ax/" target="_blank">
          <img src={veraxLogo} className="logo" alt="Verax logo" />
        </a>
      </div>

      <h1>Verax Attestation Registry</h1>
      <p>
        Verax is a shared registry for storing attestations of public interest on EVM chains,
        <br /> designed to enhance data discoverability and consumption for dApps across the network.{" "}
      </p>
    </div>
  );
};

export default Home;

import { Beliefs, Desires, Intentions, Rewards } from "./types";

export class RLBDIAgent {
  private beliefs: Beliefs;
  private desires: Desires;
  private intentions: Intentions;
  private rewards: Rewards;
  private setBeliefs: React.Dispatch<React.SetStateAction<Beliefs>>;
  private setDesires: React.Dispatch<React.SetStateAction<Desires>>;
  private setIntentions: React.Dispatch<React.SetStateAction<Intentions>>;

  constructor(
    beliefs: Beliefs,
    desires: Desires,
    intentions: Intentions,
    setBeliefs: React.Dispatch<React.SetStateAction<Beliefs>>,
    setDesires: React.Dispatch<React.SetStateAction<Desires>>,
    setIntentions: React.Dispatch<React.SetStateAction<Intentions>>
  ) {
    this.beliefs = beliefs;
    this.desires = desires;
    this.intentions = intentions;
    this.rewards = {};
    this.setBeliefs = setBeliefs;
    this.setDesires = setDesires;
    this.setIntentions = setIntentions;
  }

  updateBeliefs(feature: string, dependencies: any) {
    this.setBeliefs((prevBeliefs) => ({
      ...prevBeliefs,
      [feature]: dependencies
    }));
  }

  refineDesires(feature: string) {
    this.setDesires((prevDesires) => ({
      ...prevDesires,
      [feature]: `The AI wants to refine and expand dependencies for ${feature}.`
    }));
  }

  updateIntentions(feature: string, selected: string[]) {
    this.setIntentions((prevIntentions) => ({
      ...prevIntentions,
      [feature]: `The AI intends to analyze the selected dependencies for ${feature}.`
    }));
  }

  reward(feature: string, success = true) {
    if (!this.rewards[feature]) {
      this.rewards[feature] = { success: 0, penalty: 0 };
    }
    
    if (success) {
      this.rewards[feature].success += 1;
    } else {
      this.rewards[feature].penalty += 1;
    }
  }
}

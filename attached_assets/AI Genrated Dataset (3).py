import streamlit as st
import networkx as nx
import pandas as pd
import numpy as np
from pyvis.network import Network
import tempfile
import os
import google.generativeai as genai
import time
import re
import random
from dotenv import load_dotenv

# Configure Google AI API
load_dotenv()  # Load environment variables from .env file
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))  # Replace with your actual API Key

# Initialize session state for AI beliefs, desires, intentions, and rewards
if "beliefs" not in st.session_state:
    st.session_state.beliefs = {}
if "desires" not in st.session_state:
    st.session_state.desires = {}
if "intentions" not in st.session_state:
    st.session_state.intentions = {}
if "rewards" not in st.session_state:
    st.session_state.rewards = {}

# 🎯 RL-BDI Agent (Belief-Desire-Intention Model)
class RLBDIAgent:
    def update_beliefs(self, feature, dependencies):
        """ Update AI beliefs when new dependencies are added. """
        st.session_state.beliefs[feature] = dependencies

    def refine_desires(self, feature):
        """ Adjust AI desires based on new dependencies. """
        st.session_state.desires[feature] = f"The AI wants to refine and expand dependencies for {feature}."

    def update_intentions(self, feature, selected):
        """ Update AI intentions when dependencies are selected. """
        st.session_state.intentions[feature] = f"The AI intends to analyze the selected dependencies for {feature}."

    def reward(self, feature, success=True):
        """ Reinforcement Learning Feedback for AI Learning. """
        if feature not in st.session_state.rewards:
            st.session_state.rewards[feature] = {"success": 0, "penalty": 0}
        if success:
            st.session_state.rewards[feature]["success"] += 1
        else:
            st.session_state.rewards[feature]["penalty"] += 1

# Initialize AI Agent
agent = RLBDIAgent()

def normalize_text(text):
    """ Normalize AI response by converting inconsistent spaces/tabs into a standard format. """
    return re.sub(r"\*\s{2,}", "* ", text)  # Replace extra spaces after asterisks with a single space

def get_ai_dependencies(feature, full_context=None):
    """ Fetch AI-generated dependencies while ensuring full hierarchical context. """
    context_string = f" (for {full_context})" if full_context else ""

    prompt = (
        f"Identify at least **10-20 primary dependencies** for '{feature}{context_string}', ensuring they are **directly relevant**."
        " Format each dependency as:\n"
        "* **Dependency Name** – (Reason why it is a primary dependency)\n"
        "\n"
        "### Important Instructions:\n"
        "1. **Focus Only on Primary Dependencies** – No secondary ones.\n"
        f"2. **Ensure Relevance** – {feature} Dependencies must have a **strong logical connection** to the {context_string}.\n"
        "3. **Avoid Generic Dependencies** – Must have a clear, well-explained purpose.\n"
        "4. **Maintain Clarity & Structure** – Use precise technical terms.\n"
        "\n"
        "Proceed with generating the list."
    )

    try:
        response = genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)
        raw_output = response.text if response.text else "EMPTY RESPONSE"

        if raw_output == "EMPTY RESPONSE":
            st.warning(f"⚠️ AI did not return dependencies for {feature}. Using fallback values.")
            return {"Primary": [f"Placeholder Dependency {i+1} (for {feature}{context_string})" for i in range(5)]}, {}

        primary_dependencies = []
        explanations = {}

        for line in raw_output.split("\n"):
            line = line.strip()
            match = re.match(r"^\*\s*\**(.+?)\**\s*\((.+?)\)$", line)
            if match:
                dependency_name, reason = match.groups()
                full_dependency_name = f"{dependency_name} (for {feature}{context_string})"
                primary_dependencies.append(full_dependency_name)
                explanations[full_dependency_name] = reason.strip()

        if len(primary_dependencies) < 10:
            default_fallbacks = [f"Feature {i+1} (for {feature}{context_string})" for i in range(10 - len(primary_dependencies))]
            primary_dependencies.extend(default_fallbacks)

        return {"Primary": primary_dependencies[:20]}, explanations  # Trim to 20 max

    except Exception as e:
        st.error(f"⚠️ AI Error: {e}")
        return {"Primary": [f"Error Handling (for {feature}{context_string})"]}, {}

# Initialize session state for dependencies
if "dependencies" not in st.session_state:
    st.session_state.dependencies = {}
if "explanations" not in st.session_state:
    st.session_state.explanations = {}
if "selected_dependencies" not in st.session_state:
    st.session_state.selected_dependencies = {}
if "expanded_nodes" not in st.session_state:
    st.session_state.expanded_nodes = set()

# Main App
st.title("🤖 AI-Powered Dynamic Dependency Analyzer")

# Step 1: Enter Target Feature
st.subheader("Step 1: Enter a Target Feature")
target_feature = st.text_input("Enter the Target Feature (e.g., AI recruiter agent):")

if target_feature and target_feature not in st.session_state.dependencies:
    deps, explanations = get_ai_dependencies(target_feature)
    st.session_state.dependencies[target_feature] = deps
    st.session_state.explanations[target_feature] = explanations
    st.session_state.selected_dependencies[target_feature] = []

    # ✅ Update BDI
    agent.update_beliefs(target_feature, deps)
    agent.refine_desires(target_feature)

# Step 2: Select & Confirm Dependencies
st.subheader("Step 2: Select & Expand Dependencies")
for parent, children in list(st.session_state.dependencies.items()):
    st.write(f"### Dependencies for: {parent}")

    for category, items in children.items():
        if items:
            st.markdown(f"**🔹 {category} Dependencies:**")
            for item in items:
                base_feature_name = re.sub(r'\*\*\s*–.*|\s*\(.*', '', item).strip()  # Clean up the item
                explanation = st.session_state.explanations[parent].get(item, "No explanation provided.")
                cleaned_explanation = re.sub(r'\s*\(.*\)', '', explanation).strip()  # Remove anything in parentheses
                st.markdown(f"- **{base_feature_name}**: {cleaned_explanation}")

    valid_options = sum(children.values(), [])  # Flatten list of dependencies
    previous_selection = st.session_state.selected_dependencies.get(parent, [])
    filtered_selection = [item for item in previous_selection if item in valid_options]

    base_feature_names = [re.sub(r'\*\*\s*–.*|\s*\(.*', '', item).strip() for item in valid_options]  # Extract only the feature name

    selected = st.multiselect(
        f"Select dependencies for {parent}:",
        options=base_feature_names,  # Use base feature names for the dropdown
        default=filtered_selection,  # Retain only valid defaults
    )

    manual_dependency = st.text_input(f"Add a custom dependency for {parent} (optional):", key=f"manual_{parent}")
    if manual_dependency:
        if manual_dependency not in base_feature_names:
            base_feature_names.append(manual_dependency)  # Dynamically add new user dependency
        if manual_dependency not in selected:
            selected.append(manual_dependency)  # Auto-select it

    if st.button(f"✅ Confirm & Expand {parent}", key=f"confirm_{parent}"):
        with st.spinner("Updating AI beliefs, desires, and intentions..."):
            st.session_state.selected_dependencies[parent] = selected
            st.session_state.expanded_nodes.add(parent)

            # Update AI Intentions after selection
            agent.update_intentions(parent, selected)

            # Expand AI Dependencies
            for item in selected:
                if item not in st.session_state.dependencies:
                    deps, explanations = get_ai_dependencies(item)
                    st.session_state.dependencies[item] = deps
                    st.session_state.explanations[item] = explanations

                    # Update BDI
                    agent.update_beliefs(item, deps)
                    agent.refine_desires(item)

            # Simulate loading of AI beliefs, desires, and intentions
            time.sleep(2)  # Simulate a delay for loading data

            # Display the updated BDI state
            st.success("AI beliefs, desires, and intentions updated successfully!")

# Display Current BDI State
# Display Current BDI State
st.subheader("Current BDI State")

# Create a placeholder for the BDI state
bdi_placeholder = st.empty()

# Display Beliefs
with bdi_placeholder.container():
    st.markdown("Beliefs")
    for feature, deps in st.session_state.beliefs.items():
        st.write(f"- **{feature}**: {', '.join(deps)}")

    # Display Desires
    st.markdown("Desires")
    for feature, desire in st.session_state.desires.items():
        st.write(f"- **{feature}**: {desire}")

    # Display Intentions
    st.markdown("Intentions")
    for feature, intention in st.session_state.intentions.items():
        st.write(f"- **{feature}**: {intention}")

# Wait for 2 seconds before clearing the BDI state
time.sleep(5)

# Clear the BDI state
bdi_placeholder.empty()
# Add this function to adjust the zoom level
if "zoom_level" not in st.session_state:
    st.session_state.zoom_level = 1.0 



# Function to set graph options
import streamlit as st
from pyvis.network import Network
import tempfile
import os

# Function to enforce proper left-to-right hierarchy
def set_graph_options(net):
    options = """
    {
      "layout": {
        "hierarchical": {
          "enabled": true,
          "direction": "LR",
          "sortMethod": "directed",
          "levelSeparation": 300,
          "nodeSpacing": 200,
          "treeSpacing": 300,
          "blockShifting": false,
          "edgeMinimization": true,
          "parentCentralization": true
        }
      },
      "physics": {
        "enabled": false
      },
      "interaction": {
        "hover": true,
        "dragNodes": true,
        "dragView": true,
        "zoomView": true
      },
      "edges": {
        "color": {
          "color": "darkblue"
        },
        "width": 2.5,
        "smooth": {
          "type": "cubicBezier",
          "forceDirection": "horizontal"
        }
      },
      "nodes": {
        "font": {
          "size": 14,
          "face": "Arial"
        },
        "shape": "box",
        "margin": 15
      }
    }
    """
    net.set_options(options)

# Function to recursively assign levels and ensure proper left-to-right expansion
def add_node_with_level(net, node, level, added_nodes, node_levels):
    if node not in added_nodes:
        net.add_node(node, label=node, shape="box", size=30, color="lightblue", level=level)
        added_nodes.add(node)
        node_levels[node] = level

    if node in st.session_state.selected_dependencies:
        for child in st.session_state.selected_dependencies[node]:
            if child not in added_nodes:
                net.add_node(child, label=child, shape="box", size=20, color="lightgreen", level=level + 1)
                added_nodes.add(child)
                node_levels[child] = level + 1
            
            net.add_edge(node, child, color="darkblue", width=2.5)
            # Recursively assign levels for deeper dependencies
            add_node_with_level(net, child, level + 1, added_nodes, node_levels)

# Function to generate the interactive left-to-right dependency graph
def generate_interactive_graph():
    net = Network(height="750px", width="100%", directed=True)

    set_graph_options(net)

    if "selected_dependencies" not in st.session_state:
        st.session_state.selected_dependencies = {}

    added_nodes = set()
    node_levels = {}

    # Assign levels recursively to the graph structure
    for parent in st.session_state.selected_dependencies.keys():
        add_node_with_level(net, parent, level=0, added_nodes=added_nodes, node_levels=node_levels)

    temp_dir = tempfile.gettempdir()
    graph_path = os.path.join(temp_dir, "interactive_graph.html")
    net.write_html(graph_path)

    return graph_path

# Button to generate the graph
if st.button("🔄 Generate Interactive Graph"):
    graph_html = generate_interactive_graph()
    with open(graph_html, "r", encoding="utf-8") as file:
        st.components.v1.html(file.read(), height=550)

# Button to download the graph
if os.path.exists(tempfile.gettempdir() + "/interactive_graph.html"):
    with open(tempfile.gettempdir() + "/interactive_graph.html", "rb") as file:
        st.download_button(label="📥 Download Interactive Graph", data=file, file_name="graph.html", mime="text/html")

# Step 4: Generate Synthetic Dataset
st.subheader("Step 4: Generate Synthetic Dataset")

if st.button("📄 Generate Dataset"):
    if not st.session_state.selected_dependencies:
        st.warning("⚠️ No dependencies selected. Please expand some dependencies first.")
    else:
        # Extract all features and determine depth
        feature_levels = {}  # {feature: depth}
        def assign_depth(feature, depth=1):
            if feature in feature_levels:
                feature_levels[feature] = min(feature_levels[feature], depth)  # Store the smallest depth found
            else:
                feature_levels[feature] = depth
            for dep in st.session_state.selected_dependencies.get(feature, []):
                assign_depth(dep, depth + 1)

        # Get all selected root features
        root_features = list(st.session_state.selected_dependencies.keys())
        for root in root_features:
            assign_depth(root, 1)

        # Extract all unique features
        all_features = list(feature_levels.keys())

        if not all_features:
            st.warning("⚠️ No features available for dataset generation.")
        else:
            # First feature is the target variable
            target_feature = root_features[0]

            # Dictionary to store generated feature values
            data = []

            # Generate 100 rows of logical synthetic data
            for _ in range(100):
                row = {}

                # Step 1: Generate Base Feature Values
                base_values = {}
                for feature in all_features:
                    base_values[feature] = random.randint(50, 100)  # Initial random value (adjusted later)

                # Step 2: Apply Dependency-Based Adjustments with Exponential Decay
                for feature, dependencies in st.session_state.selected_dependencies.items():
                    for dependent_feature in dependencies:
                        if dependent_feature in base_values:
                            depth = feature_levels.get(dependent_feature, 1)
                            influence_factor = 1 / (1.5 ** (depth - 1))  # Exponential decay (higher depth = lower impact)
                            base_values[dependent_feature] = max(0, min(100, base_values[feature] * influence_factor + random.randint(-5, 5)))

                # Step 3: Assign values to dataset row
                for feature in all_features:
                    row[feature] = base_values[feature]

                # Step 4: Compute Target Variable with Decayed Influence from Dependencies
                if target_feature in all_features:
                    relevant_features = [f for f in all_features if f in st.session_state.selected_dependencies.get(target_feature, [])]
                    if relevant_features:
                        row[target_feature] = sum(row[f] * (1 / (1.5 ** (feature_levels[f] - 1))) for f in relevant_features)  # Weighted avg with decay

                data.append(row)

            # Convert to DataFrame
            df = pd.DataFrame(data)
            st.write("### 📝 Generated Dataset")
            st.dataframe(df)

            # Provide CSV download
            csv = df.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Download CSV",
                data=csv,
                file_name="synthetic_dataset.csv",
                mime="text/csv"
            )
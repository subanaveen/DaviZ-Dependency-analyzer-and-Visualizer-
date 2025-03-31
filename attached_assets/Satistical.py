import streamlit as st
import pandas as pd
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt
import seaborn as sns

# 🛠 Set Page Configuration (MUST BE FIRST)
st.set_page_config(page_title="Excel Statistical Analysis", layout="wide")

# Inject Tailwind CSS
TAILWIND_CSS = """
<style>
@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');

.stApp {
    background-color: #f8fafc;
    font-family: 'Inter', sans-serif;
}
</style>
"""
st.markdown(TAILWIND_CSS, unsafe_allow_html=True)


def main():
     # Navigation menu
    selected_page = st.sidebar.radio("Select Page", ["Statistical Analysis"])

    if selected_page == "Statistical Analysis":
        st.markdown('<h1 class="text-3xl font-bold text-gray-800 mb-4">Excel Statistical Analysis Tool</h1>', unsafe_allow_html=True)
        
        uploaded_file = st.file_uploader(" Upload an Excel file", type=["xls", "xlsx"], help="Supports .xls and .xlsx formats")
        
        if uploaded_file is not None:
            df = pd.read_excel(uploaded_file)
            
            # Styled preview section
            st.markdown('<div class="p-4 bg-white shadow-md rounded-lg">', unsafe_allow_html=True)
            st.markdown('<h2 class="text-xl font-semibold text-gray-700">Preview of Uploaded Data</h2>', unsafe_allow_html=True)
            st.dataframe(df.head())  
            st.markdown('</div>', unsafe_allow_html=True)

            numeric_columns = df.select_dtypes(include=np.number).columns.tolist()
            categorical_columns = df.select_dtypes(include='object').columns.tolist()

            col1, col2 = st.columns(2)
            with col1:
                selected_column = st.selectbox("Select a column for analysis", numeric_columns + categorical_columns)
            with col2:
                stat_tool = st.selectbox("Select a statistical tool", [
                    "Mean", "Median", "Mode", "Variance", "Standard Deviation", "Chi-Square Test", 
                ])
            
            if stat_tool != "Chi-Square Test":
                if st.button(" Calculate"):
                    with st.container():
                        st.markdown('<div class="p-4 bg-gray-100 rounded-lg">', unsafe_allow_html=True)
                        if stat_tool == "Mean":
                            st.success(f" Mean: {df[selected_column].mean()}")
                        elif stat_tool == "Median":
                            st.success(f" Median: {df[selected_column].median()}")
                        elif stat_tool == "Mode":
                            st.success(f" Mode: {df[selected_column].mode()[0]}")
                        elif stat_tool == "Variance":
                            st.success(f" Variance: {df[selected_column].var()}")
                        elif stat_tool == "Standard Deviation":
                            st.success(f" Standard Deviation: {df[selected_column].std()}")
                        st.markdown('</div>', unsafe_allow_html=True)
            
            if stat_tool == "Chi-Square Test" and len(categorical_columns) >= 2:
                cat_col1 = st.selectbox(" Select first categorical column", categorical_columns, key="chi1")
                cat_col2 = st.selectbox(" Select second categorical column", categorical_columns, key="chi2")
                if st.button("Run Chi-Square Test"):
                    contingency_table = pd.crosstab(df[cat_col1], df[cat_col2])
                    chi2, p, dof, expected = stats.chi2_contingency(contingency_table)
                    st.success(f"Chi-Square Statistic: {chi2:.4f}, Degrees of Freedom: {dof}, P-Value: {p:.4f}")



if __name__ == "__main__":
    main()
# Footer with Copyright Information
st.markdown(
    """
    <hr style="border:1px solid gray;margin-top:20px;margin-bottom:10px;">
    <div style="text-align:center;">
        <p>© 2025 All rights reserved.</p>
        <p>Developed by Himistu Lab.</p>
    </div>
    """,
    unsafe_allow_html=True
)

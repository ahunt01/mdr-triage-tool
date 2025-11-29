import streamlit as st
from openai import OpenAI

# 1. The Title & Config
st.set_page_config(page_title="MDR Triage Bot", page_icon="🩺")
st.title("🩺 MDR Triage & Code Predictor")
st.write("Built by [ARAN HUNT] - Senior Vigilance Specialist")

# 2. Sidebar for API Key (Keeps it secure)
with st.sidebar:
    st.header("Settings")
    api_key = st.text_input("Enter OpenAI API Key", type="password")
    st.info("Get your key from platform.openai.com")

# 3. Main Logic
st.subheader("Complaint Analysis")
complaint_text = st.text_area("Paste Complaint Description Here:", height=150, 
    placeholder="e.g., Patient reported a shock sensation. Lead impedance was > 2000 ohms.")

if st.button("Analyze Complaint"):
    if not api_key:
        st.error("Please enter an API Key in the sidebar first!")
    elif not complaint_text:
        st.warning("Please paste a complaint description.")
    else:
        # Connect to OpenAI
        client = OpenAI(api_key=api_key)
        
        with st.spinner("Consulting FDA Database logic..."):
            try:
                # The Prompt (This is the "Brain")
                prompt = f"""
                You are an Expert Medical Device Vigilance Specialist (FDA & EU MDR).
                Analyze the following complaint: "{complaint_text}"
                
                Provide the output in this strict format:
                1. **Most Likely FDA Event Code:** (e.g., V12, H34)
                2. **Code Description:** (Brief text)
                3. **MDR Reportable?** (Yes/No/Likely)
                4. **Risk Assessment:** (Low/Medium/High)
                5. **Reasoning:** (1 sentence explaining why)
                """
                
                response = client.chat.completions.create(
                    model="gpt-4o-mini", # Cheap and fast model
                    messages=[{"role": "user", "content": prompt}]
                )
                
                # Show Result
                result = response.choices[0].message.content
                st.success("Analysis Complete")
                st.markdown(result)
                
            except Exception as e:
                st.error(f"Error: {e}")

# 4. Footer
st.markdown("---")

st.caption("Disclaimer: This is an AI demo for interview purposes. Always verify with official FDA coding manuals.")

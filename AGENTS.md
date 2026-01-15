# BuffaloBuffalo

## Intro and Rule

This is the prompt zero AGENTS.md file for the project BuffaloBuffalo in a folder of the same name.  

The goal of the BuffaloBuffalo project is to create a web application which allows the construction, visualization, and interpretation of [Buffalo sentences](https://en.wikipedia.org/wiki/Buffalo_buffalo_Buffalo_buffalo_buffalo_buffalo_Buffalo_buffalo), which is the primary lesson oI recall from Professor Stephen Pinker in 9.01.   

You will maintain a README.md file for humans and a AGENTS.md for agent use.  This is the file AGENTS.md, you may edit it freely to assist in your project.A hook is providing a PROMPTS.md which you may review but not edit.  If you need long term storage of working concepts, create a MEMORY.md file which I may edit as well.

## Project Description

We will allow the creation of these Buffalo sentences, create a possible parse trees from it, visualize the parse tree, and ask an LLM to inference an interpretation of the sentence using the parse tree's sentence structure.

We will need to create a parse tree generator. We are focused on English.  It should be generic and work on any english sentence, given a dictionary.  You may generate a valid dictionary subset for your unit tests which don't involve buffalo but do verify the parse tree generator.  You will create a specific dictionary which only includes Bufallo in all its parts of speech.

You will then create a visualizer for this parse tree generator that we may embed in a web app.  The graph structure in the Wikipedia article might be useful, but there is also classic elementary school sentence diagramming visualizations as well, which are more interesting.   

With those tools in hand, we will create a simple webapp which allows the entry of these sentences They can picking the Buffalo with the specific part of speech, but there is also a IDK block which is like a wildcard which becomes the most likely interpretation of the sentence.

Once a valid sentence is chosen and visualized, a user may optionally submit it for inference, where an LLM inteprets the sentence along with parts-of-speech metadata.



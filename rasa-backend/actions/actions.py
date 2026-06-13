from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionCustomFallback(Action):
    #A custom fallback action that triggers when the bot fails to understand the user's intent

    def name(self) -> Text:
        return "action_custom_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Retrieve the current value of the 'lang' slot to determine the user's language
        lang = tracker.get_slot("lang")

        # Route the fallback response based on the detected language
        if lang == "el":
            # Send the Greek fallback message
            dispatcher.utter_message(template="utter_fallback_el")
        elif lang == "en":
            # Send the English fallback message
            dispatcher.utter_message(template="utter_fallback_en")
        else:
            # Send a bilingual fallback message if the language slot is empty or undetected
            dispatcher.utter_message(template="utter_fallback_both")

        # Return an empty list as this action does not modify slots or trigger events
        return []
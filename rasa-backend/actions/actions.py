from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

class ActionCustomFallback(Action):
    def name(self) -> Text:
        return "action_custom_fallback"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Παίρνουμε την τιμή του slot 'lang'
        lang = tracker.get_slot("lang")

        if lang == "el":
            dispatcher.utter_message(template="utter_fallback_el")
        elif lang == "en":
            dispatcher.utter_message(template="utter_fallback_en")
        else:
            dispatcher.utter_message(template="utter_fallback_both")

        return []
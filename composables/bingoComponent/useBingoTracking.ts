import type Card from "~/interfaces/Card";
import type { UserCard } from "~/interfaces/User";


export function useBingoTracking(card: Card & UserCard) {

  const { getUser } = useRefreshUser();
  const { $lstorage, $sStorage, $toast } = useNuxtApp();
  const sessionUser = ref($lstorage.getData("bingoUser"));
  const cardType = card.creator.user_id === null ? "dailyBingo" : "currentCard";

  const STATIC = {
    length: 25,
    scale: 5,
    highlightColor: "#76FF03", // MDI light-green-accent-3
  }

  function saveCard(name="") {
    if (!card.saved) { saveNewCard(name) } 
    else { saveProgress(card, { marked: card.marked }); syncProgress() }
  }

  // Save current progress locally
  function saveProgress(card: Card, properties: any) {
    $lstorage.setData(cardType, { ...card, ...properties }); 
  }

  // Sync current progress with DB
  async function syncProgress() {
    await $fetch(`/api/users/${sessionUser.value._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operation: "cards-update",
        data: {
          card: card._id,
          marked: card.marked
        }
      })
    });
  }

  // Save a new card to the user's collection
  async function saveNewCard(name: string) {
    let newCard: Card | (Card & UserCard) = card;

    if (!card.marked) card.marked = new Array(STATIC.length).fill(false);

    // If it's a daily bingo card that does not exist in the system, create it
    if (cardType === "dailyBingo" && !card._id) {
      newCard = await $fetch<Card>("/api/cards/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cells: card.cells, created_at: card.created_at, name, isDailyBingo: true,
          creator: {
            user_id: card?.creator.user_id,
            username: card?.creator.username,
          },
        }),
      })
    }

    // Add the card to the user's card collection
    await $fetch(`/api/users/${sessionUser.value._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: {
        _id: newCard._id, marked: (newCard as Card & UserCard).marked
      }, operation: "cards-insert" }),
    });

    // Update local storage
    saveProgress(newCard, { saved: true });

    sessionUser.value = await getUser();
    $toast.success(`${name} saved`);
  }

  function resetCard() {
    // TODO: Implement resetting wins

    card.marked = new Array(STATIC.length).fill(false);
    (cardType === "currentCard" ? $sStorage : $lstorage).setData(cardType, {...card, marked: card.marked});

    if (card.saved) saveCard();
  }

  function updateWins() {

  }

  return {
    saveCard,
    resetCard,
    updateWins,
  }

}

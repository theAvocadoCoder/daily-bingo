import type Card from "~/interfaces/Card";


export function useBingoTracking(card: Card) {

  const { getUser } = useRefreshUser();
  const { $lstorage, $toast } = useNuxtApp();
  const sessionUser = computed(() => $lstorage.getData("bingoUser"));
  const cardType = card.creator.user_id === null ? "dailyBingo" : "currentCard";

  const STATIC = {
    length: 25,
    scale: 5,
    highlightColor: "#76FF03", // MDI light-green-accent-3
  }

  function saveCard(name="") {
    if (!card.saved) { saveNewCard(name) } 
    else { saveProgress(card, { cells: card.cells }); syncProgress() }
  }

  // Save current progress locally
  function saveProgress(card: Card, properties: any) {
    $lstorage.setData(cardType, { ...card, ...properties }); 
  }

  // Sync current progress with DB
  async function syncProgress() {
    await $fetch(`/api/cards/${card._id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        card: {
          cells: card.cells,
          created_at: new Date().toISOString(),
          creator: {
            user_id: null,
            username: "Daily Bingo"
          }
        }
      })
    });
  }

  // Save a new card to the user's collection
  async function saveNewCard(name: string) {
    let newCard = card;

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

    // Add the card's id to the user's cards
    await $fetch(`/api/users/${sessionUser.value._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: newCard?._id, operation: "cards-insert" }),
    });

    // Update local storage
    saveProgress(newCard, { saved: true })

    await getUser();
    $lstorage.setData("bingoUser", sessionUser.value);
    $toast.success(`${name} saved`);
  }

  function resetCard() {
    // TODO: Implement resetting wins

    for (let i = 0; i < card.cells.length; i++) {
      card.cells[i].marked = false;
    }
    $lstorage.setData(cardType, {...card, cells: card.cells});

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

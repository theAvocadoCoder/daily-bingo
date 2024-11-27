
export default defineEventHandler(async (event) => {
  await sendRedirect(event, '/', 302)  
});

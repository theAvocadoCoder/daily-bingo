<template>
  <header>
    <nav>
      <ul>
        <li><nuxt-link to="/">Home</nuxt-link></li>
        <li><nuxt-link to="/bingo">Bingo</nuxt-link></li>
      </ul>
    </nav>
  </header>
</template>

<style>
  ul {
    display: flex;
    justify-content: center;

    & li {
      list-style-type: none;
      padding-inline: .5rem;
    }
  }
</style>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ArrowRight, Clock3 } from "lucide-vue-next";
import { articles } from "../../data/site";

const categories = ["全部", ...new Set(articles.map((article) => article.category))];
const activeCategory = ref("全部");
const filteredArticles = computed(() =>
  activeCategory.value === "全部"
    ? articles
    : articles.filter((article) => article.category === activeCategory.value),
);
</script>

<template>
  <main id="main-content" class="custom-page inner-page articles-page">
    <header class="page-hero page-hero--split">
      <div>
        <p class="eyebrow">WRITING</p>
        <h1>记录判断依据，<br />而不只是最终答案。</h1>
      </div>
      <p>文章围绕架构设计、工程实践与 AI 工程展开。每篇内容尽量从真实问题出发，给出约束、取舍与验证方式。</p>
    </header>

    <div class="filter-bar" aria-label="按文章分类筛选">
      <span>分类</span>
      <div class="filter-options">
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          :class="{ active: activeCategory === category }"
          :aria-pressed="activeCategory === category"
          @click="activeCategory = category"
        >
          {{ category }}
        </button>
      </div>
      <span class="filter-count">{{ filteredArticles.length }} 篇</span>
    </div>

    <section class="article-index" aria-live="polite">
      <article v-for="article in filteredArticles" :key="article.href" class="article-index__item">
        <a class="card-hit-area" :href="article.href" :aria-label="`阅读文章：${article.title}`"></a>
        <div class="article-index__meta">
          <span>{{ article.category }}</span>
          <time :datetime="article.date">{{ article.date }}</time>
          <span><Clock3 :size="15" aria-hidden="true" />{{ article.readingTime }}</span>
        </div>
        <div class="article-index__body">
          <div>
            <h2>{{ article.title }}</h2>
            <p>{{ article.description }}</p>
          </div>
          <ArrowRight :size="22" aria-hidden="true" />
        </div>
        <ul class="tag-list" aria-label="文章标签">
          <li v-for="tag in article.tags" :key="tag"># {{ tag }}</li>
        </ul>
      </article>
    </section>
  </main>
</template>


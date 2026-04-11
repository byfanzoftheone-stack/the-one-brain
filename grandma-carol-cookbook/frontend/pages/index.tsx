import Link from 'next/link'

export default function Home() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Grandma Carol Cookbook</h1>
      <Link href="/recipes">Recipes</Link><br/>
      <Link href="/memory-wall">Memory Wall</Link>
    </div>
  )
}

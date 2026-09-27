"use client";

export default function StudentTable({ students, refresh }: any){

  async function remove(id:string){

    if(!confirm("Delete Student?")) return;

    await fetch(`/api/students/${id}`,{
      method:"DELETE"
    });

    refresh();
  }

  return(
    <div className="bg-white rounded-xl shadow overflow-auto">

      <table className="w-full">

        <thead className="bg-blue-900 text-white">

          <tr>
            <th className="p-3">College ID</th>
            <th>Name</th>
            <th>Register No</th>
            <th>Department</th>
            <th>Year</th>
            <th>Semester</th>
            <th>Section</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {students.map((student:any)=>(

            <tr
              key={student.id}
              className="border-b text-center hover:bg-gray-50"
            >

              <td className="p-3">{student.user.collegeId}</td>
              <td>{student.user.name}</td>
              <td>{student.registerNo}</td>
              <td>{student.department}</td>
              <td>{student.year}</td>
              <td>{student.semester}</td>
              <td>{student.section}</td>

              <td className="space-x-2">

                <button className="text-green-600 font-medium">
                  Edit
                </button>

                <button
                  onClick={()=>remove(student.id)}
                  className="text-red-600 font-medium"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {students.length===0 && (
        <div className="p-10 text-center text-gray-400">
          No Students Available
        </div>
      )}

    </div>
  )
}